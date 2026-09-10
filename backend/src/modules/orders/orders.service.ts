import { randomInt } from 'crypto';
import { Request } from 'express';
import { NotificationType, OrderStatus, PaymentMethod, PaymentStatus, Prisma, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { recordNotification } from '../notifications/notifications.service';
import { AdminListOrdersQuery, CreateOrderInput } from './orders.schema';

const orderInclude = {
  items: { include: { product: { include: { photos: true, owner: { select: { id: true, name: true } } } } } },
  shippingAddress: true,
  statusHistory: { orderBy: { createdAt: 'asc' } },
  transportOrder: { select: { id: true, status: true } },
  payment: { include: { statusHistory: { orderBy: { createdAt: 'asc' } } } },
} satisfies Prisma.OrderInclude;

function generatePaymentReference(): string {
  return `XKW-${randomInt(0, 100_000_000).toString().padStart(8, '0')}`;
}

// Agrupa os itens do pedido por vendedor (uma encomenda pode juntar produtos de vários
// vendedores) e credita a cada um o valor correspondente aos seus itens.
async function creditSellersForOrder(
  tx: Prisma.TransactionClient,
  order: { items: { lineTotal: Prisma.Decimal; product: { ownerId: string } }[] },
) {
  const bySeller = new Map<string, Prisma.Decimal>();
  for (const item of order.items) {
    const current = bySeller.get(item.product.ownerId) ?? new Prisma.Decimal(0);
    bySeller.set(item.product.ownerId, current.plus(item.lineTotal));
  }

  for (const [sellerId, amount] of bySeller.entries()) {
    await tx.wallet.upsert({
      where: { userId: sellerId },
      update: { balance: { increment: amount } },
      create: { userId: sellerId, balance: amount },
    });
  }
}

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

  // XKWANZA Protect: para WALLET o débito é imediato e os fundos ficam logo em custódia;
  // para BANK_TRANSFER/PAYMENT_REFERENCE não há gateway real — o pagamento fica PENDING até
  // o comprador assinalar que pagou e o suporte/administração confirmar manualmente o depósito.
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

    let paymentData: Prisma.PaymentCreateWithoutOrderInput;
    if (input.paymentMethod === PaymentMethod.WALLET) {
      const wallet = await tx.wallet.findUnique({ where: { userId: buyerId } });
      if (!wallet || wallet.balance.lessThan(subtotal)) {
        throw ApiError.badRequest('Saldo insuficiente na carteira XKWANZA');
      }
      await tx.wallet.update({ where: { userId: buyerId }, data: { balance: { decrement: subtotal } } });
      paymentData = {
        method: PaymentMethod.WALLET,
        status: PaymentStatus.PAID,
        amount: subtotal,
        custodyHeld: true,
        statusHistory: { create: { status: PaymentStatus.PAID, note: 'Pago com a carteira XKWANZA' } },
      };
    } else {
      paymentData = {
        method: input.paymentMethod,
        status: PaymentStatus.PENDING,
        amount: subtotal,
        custodyHeld: false,
        externalRef: input.paymentMethod === PaymentMethod.PAYMENT_REFERENCE ? generatePaymentReference() : undefined,
        statusHistory: { create: { status: PaymentStatus.PENDING, note: 'Aguarda pagamento' } },
      };
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
        payment: { create: paymentData },
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

// Uso administrativo — vê todos os pedidos da plataforma, não só os do próprio comprador/vendedor.
export async function listOrdersForAdmin(query: AdminListOrdersQuery) {
  const where: Prisma.OrderWhereInput = { status: query.status };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        ...orderInclude,
        buyer: { select: { id: true, name: true, phone: true, email: true } },
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
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

  // XKWANZA Protect: só se confirma o pedido (o vendedor começa a preparar) depois de o
  // pagamento estar efectivamente pago e em custódia.
  if (newStatus === OrderStatus.CONFIRMED && order.payment?.status !== PaymentStatus.PAID) {
    throw ApiError.badRequest('O pagamento ainda não foi confirmado');
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (newStatus === OrderStatus.CANCELLED) {
      // Repõe o stock reservado ao cancelar.
      for (const item of order.items) {
        await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }

      if (order.payment) {
        if (order.payment.status === PaymentStatus.PAID) {
          // Fundos já em custódia (inclui carteira, já debitada) — devolve ao comprador.
          if (order.payment.method === PaymentMethod.WALLET) {
            await tx.wallet.upsert({
              where: { userId: order.buyerId },
              update: { balance: { increment: order.payment.amount } },
              create: { userId: order.buyerId, balance: order.payment.amount },
            });
          }
          await tx.payment.update({
            where: { orderId },
            data: {
              status: PaymentStatus.REFUNDED,
              custodyHeld: false,
              statusHistory: { create: { status: PaymentStatus.REFUNDED, note: 'Pedido cancelado' } },
            },
          });
        } else if (order.payment.status === PaymentStatus.PENDING || order.payment.status === PaymentStatus.PROCESSING) {
          await tx.payment.update({
            where: { orderId },
            data: {
              status: PaymentStatus.CANCELLED,
              statusHistory: { create: { status: PaymentStatus.CANCELLED, note: 'Pedido cancelado' } },
            },
          });
        }
      }
    }

    if (newStatus === OrderStatus.COMPLETED && order.payment?.custodyHeld) {
      // Liberta a custódia XKWANZA Protect para o(s) vendedor(es) assim que o comprador confirma a recepção.
      await creditSellersForOrder(tx, order);
      await tx.payment.update({
        where: { orderId },
        data: { custodyHeld: false, releasedAt: new Date() },
      });
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

  // Notifica sempre "o outro lado" — quem não fez a alteração.
  const sellerIds = [...new Set(order.items.map((item) => item.product.ownerId))];
  const notifyTargets = isBuyer ? sellerIds : [order.buyerId];
  await Promise.all(
    notifyTargets.map((targetId) =>
      recordNotification({
        userId: targetId,
        type: NotificationType.STATUS_CHANGE,
        title: 'Estado do pedido actualizado',
        body: `O pedido #${orderId.slice(0, 8)} passou para "${newStatus}".`,
        metadata: { orderId, status: newStatus },
      }),
    ),
  );

  return updated;
}
