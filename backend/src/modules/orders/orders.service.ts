import { Request } from 'express';
import { OrderStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { CreateOrderInput } from './orders.schema';

const orderInclude = {
  items: { include: { product: { include: { photos: true, owner: { select: { id: true, name: true } } } } } },
  shippingAddress: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
  transportOrder: { select: { id: true, status: true } },
} satisfies Prisma.OrderInclude;

// Estados alcançáveis a partir de cada estado. PICKED_UP/IN_TRANSIT/DELIVERED são normalmente
// avançados pelo módulo de transporte (Fase 3) através do transportador atribuído; READY_FOR_PICKUP
// -> COMPLETED continua disponível para entregas geridas directamente pelo vendedor, sem transportador.
const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  CREATED: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  PREPARING: [OrderStatus.READY_FOR_PICKUP],
  READY_FOR_PICKUP: [OrderStatus.COMPLETED],
  PICKED_UP: [],
  IN_TRANSIT: [],
  DELIVERED: [OrderStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

function isSellerOfOrder(order: { items: { product: { ownerId: string } }[] }, userId: string) {
  return order.items.some((item) => item.product.ownerId === userId);
}

export async function checkout(buyerId: string, input: CreateOrderInput, req: Request) {
  const address = await prisma.address.findUnique({ where: { id: input.shippingAddressId } });
  if (!address || address.userId !== buyerId) throw ApiError.badRequest('Morada de entrega inválida');

  const productIds = input.items.map((item) => item.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

  if (products.length !== new Set(productIds).size) {
    throw ApiError.badRequest('Um ou mais produtos não foram encontrados');
  }

  for (const item of input.items) {
    const product = products.find((p) => p.id === item.productId)!;
    if (product.status !== 'PUBLISHED') {
      throw ApiError.badRequest(`Produto "${product.name}" não está disponível`);
    }
    if (product.ownerId === buyerId) {
      throw ApiError.badRequest('Não pode comprar o seu próprio produto');
    }
    if (product.stock < item.quantity) {
      throw ApiError.badRequest(`Stock insuficiente para "${product.name}"`);
    }
  }

  const orderItemsData = input.items.map((item) => {
    const product = products.find((p) => p.id === item.productId)!;
    const unitPrice = product.price;
    const lineTotal = unitPrice.times(item.quantity);
    return { productId: product.id, quantity: item.quantity, unitPrice, lineTotal };
  });

  const subtotal = orderItemsData.reduce((sum, item) => sum.plus(item.lineTotal), new Prisma.Decimal(0));

  const order = await prisma.$transaction(async (tx) => {
    for (const item of input.items) {
      const result = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (result.count === 0) {
        throw ApiError.conflict('Stock alterado durante o pedido. Tente novamente.');
      }
    }

    const created = await tx.order.create({
      data: {
        buyerId,
        shippingAddressId: input.shippingAddressId,
        subtotal,
        transportCost: 0,
        total: subtotal,
        items: { create: orderItemsData },
        statusHistory: { create: { status: OrderStatus.CREATED, note: 'Pedido criado' } },
      },
      include: orderInclude,
    });

    return created;
  });

  await recordAudit({
    userId: buyerId,
    action: 'ORDER_CREATED',
    entity: 'Order',
    entityId: order.id,
    result: 'SUCCESS',
    metadata: { total: order.total.toString(), items: order.items.length },
    req,
  });

  return order;
}

export async function listMyOrdersAsBuyer(buyerId: string, page: number, pageSize: number) {
  const where = { buyerId };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function listReceivedOrders(sellerId: string, page: number, pageSize: number) {
  const where: Prisma.OrderWhereInput = { items: { some: { product: { ownerId: sellerId } } } };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page, pageSize };
}

export async function getOrderForUser(orderId: string, userId: string, role: UserRole) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw ApiError.notFound('Pedido não encontrado');

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isBuyer = order.buyerId === userId;
  const isSeller = isSellerOfOrder(order, userId);

  if (!isAdmin && !isBuyer && !isSeller) {
    throw ApiError.forbidden('Sem acesso a este pedido');
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  userId: string,
  role: UserRole,
  newStatus: OrderStatus,
  note: string | undefined,
  req: Request,
) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: orderInclude });
  if (!order) throw ApiError.notFound('Pedido não encontrado');

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isBuyer = order.buyerId === userId;
  const isSeller = isSellerOfOrder(order, userId);

  const wantsCancel = newStatus === OrderStatus.CANCELLED;
  // O comprador pode confirmar a recepção (DELIVERED -> COMPLETED); as restantes transições
  // ficam a cargo do vendedor (entrega directa) ou são avançadas pelo módulo de transporte.
  const buyerCanComplete = order.status === OrderStatus.DELIVERED && newStatus === OrderStatus.COMPLETED;

  if (wantsCancel) {
    if (!isBuyer && !isSeller && !isAdmin) throw ApiError.forbidden('Sem acesso a este pedido');
  } else if (!isSeller && !isAdmin && !(isBuyer && buyerCanComplete)) {
    throw ApiError.forbidden('Apenas o vendedor pode avançar o estado do pedido');
  }

  const allowed = ORDER_TRANSITIONS[order.status];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(`Não é possível mudar de "${order.status}" para "${newStatus}"`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (newStatus === OrderStatus.CANCELLED) {
      // Repõe o stock reservado ao cancelar.
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        statusHistory: { create: { status: newStatus, note } },
      },
      include: orderInclude,
    });
  });

  await recordAudit({
    userId,
    action: 'ORDER_STATUS_UPDATED',
    entity: 'Order',
    entityId: orderId,
    result: 'SUCCESS',
    metadata: { from: order.status, to: newStatus },
    req,
  });

  return updated;
}
