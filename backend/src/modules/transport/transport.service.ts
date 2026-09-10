import { randomInt } from 'crypto';
import { Request } from 'express';
import { OrderStatus, Prisma, TransportStatus, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { CreateProposalInput, ListOpenTransportOrdersQuery } from './transport.schema';

const transportOrderInclude = {
  order: {
    include: {
      buyer: { select: { id: true, name: true, phone: true } },
      shippingAddress: true,
      items: { include: { product: { include: { photos: true, owner: { select: { id: true, name: true } } } } } },
    },
  },
  transporter: { include: { user: { select: { id: true, name: true, phone: true } } } },
  proposals: {
    include: { transporter: { include: { user: { select: { id: true, name: true } } } } },
    orderBy: { createdAt: 'asc' },
  },
  statusHistory: { orderBy: { createdAt: 'asc' } },
} satisfies Prisma.TransportOrderInclude;

// Cancelamento só é permitido antes da recolha física — depois disso o transporte já está em curso.
const CANCELLABLE_STATUSES: TransportStatus[] = [
  TransportStatus.REQUESTED,
  TransportStatus.ASSIGNED,
  TransportStatus.ACCEPTED,
];

type TransportOrderWithRelations = Prisma.TransportOrderGetPayload<{ include: typeof transportOrderInclude }>;

function generateOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function isOrderSeller(order: { items: { product: { ownerId: string } }[] }, userId: string) {
  return order.items.some((item) => item.product.ownerId === userId);
}

// Uso administrativo — vê todas as entregas/transportes da plataforma.
export async function listTransportOrdersForAdmin(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.transportOrder.findMany({
      include: transportOrderInclude,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transportOrder.count(),
  ]);
  return { items, total, page, pageSize };
}

async function getTransportOrderOrThrow(id: string) {
  const transportOrder = await prisma.transportOrder.findUnique({ where: { id }, include: transportOrderInclude });
  if (!transportOrder) throw ApiError.notFound('Pedido de transporte não encontrado');
  return transportOrder;
}

// Os códigos OTP só devem ser visíveis a quem os vai entregar fisicamente ao transportador:
// o vendedor mostra o código de recolha, o comprador mostra o código de entrega. O transportador
// (e qualquer outro perfil) nunca os vê pela aplicação — tem de os obter presencialmente.
function sanitizeOtps(transportOrder: TransportOrderWithRelations, userId: string, isAdmin = false) {
  const isBuyer = transportOrder.order.buyerId === userId;
  const isSeller = isOrderSeller(transportOrder.order, userId);

  return {
    ...transportOrder,
    pickupOtp: isSeller || isAdmin ? transportOrder.pickupOtp : null,
    deliveryOtp: isBuyer || isAdmin ? transportOrder.deliveryOtp : null,
  };
}

async function getMyTransporterOrThrow(userId: string) {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) throw ApiError.badRequest('Crie primeiro o seu perfil de transportador');
  return transporter;
}

export async function requestTransport(userId: string, orderId: string, req: Request) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } }, transportOrder: true },
  });
  if (!order) throw ApiError.notFound('Pedido não encontrado');

  const isBuyer = order.buyerId === userId;
  const isSeller = isOrderSeller(order, userId);
  if (!isBuyer && !isSeller) throw ApiError.forbidden('Sem acesso a este pedido');

  if (order.status !== OrderStatus.READY_FOR_PICKUP) {
    throw ApiError.badRequest('O pedido só pode ser encaminhado para transporte quando estiver pronto para recolha');
  }
  if (order.transportOrder) {
    throw ApiError.conflict('Já existe um pedido de transporte para esta encomenda');
  }

  const transportOrder = await prisma.transportOrder.create({
    data: {
      orderId,
      status: TransportStatus.REQUESTED,
      statusHistory: { create: { status: TransportStatus.REQUESTED, note: 'Pedido de transporte criado' } },
    },
    include: transportOrderInclude,
  });

  await recordAudit({
    userId,
    action: 'TRANSPORT_ORDER_REQUESTED',
    entity: 'TransportOrder',
    entityId: transportOrder.id,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(transportOrder, userId);
}

export async function listOpenTransportOrders(query: ListOpenTransportOrdersQuery) {
  const where: Prisma.TransportOrderWhereInput = {
    status: TransportStatus.REQUESTED,
    ...(query.province ? { order: { shippingAddress: { province: query.province } } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.transportOrder.findMany({
      where,
      include: transportOrderInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.transportOrder.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function listMyAssignedJobs(transporterUserId: string) {
  const transporter = await getMyTransporterOrThrow(transporterUserId);
  const jobs = await prisma.transportOrder.findMany({
    where: { transporterId: transporter.id },
    include: transportOrderInclude,
    orderBy: { createdAt: 'desc' },
  });
  return jobs.map((job) => sanitizeOtps(job, transporterUserId));
}

export async function listMyProposals(transporterUserId: string) {
  const transporter = await getMyTransporterOrThrow(transporterUserId);
  const proposals = await prisma.transportProposal.findMany({
    where: { transporterId: transporter.id },
    include: { transportOrder: { include: transportOrderInclude } },
    orderBy: { createdAt: 'desc' },
  });
  return proposals.map((proposal) => ({
    ...proposal,
    transportOrder: sanitizeOtps(proposal.transportOrder, transporterUserId),
  }));
}

export async function getTransportOrderForUser(id: string, userId: string, role: UserRole) {
  const transportOrder = await getTransportOrderOrThrow(id);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isBuyer = transportOrder.order.buyerId === userId;
  const isSeller = isOrderSeller(transportOrder.order, userId);
  const isAssignedTransporter = transportOrder.transporter?.userId === userId;
  const isOpenForBrowsing = transportOrder.status === TransportStatus.REQUESTED && role === UserRole.TRANSPORTER;

  if (!isAdmin && !isBuyer && !isSeller && !isAssignedTransporter && !isOpenForBrowsing) {
    throw ApiError.forbidden('Sem acesso a este pedido de transporte');
  }

  return sanitizeOtps(transportOrder, userId, isAdmin);
}

export async function createProposal(
  transporterUserId: string,
  role: UserRole,
  transportOrderId: string,
  input: CreateProposalInput,
  req: Request,
) {
  if (role !== UserRole.TRANSPORTER) throw ApiError.forbidden('Apenas transportadores podem propor fretes');

  const transporter = await getMyTransporterOrThrow(transporterUserId);
  if (!transporter.isAvailable) throw ApiError.badRequest('Fique disponível para poder propor fretes');

  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  if (transportOrder.status !== TransportStatus.REQUESTED) {
    throw ApiError.badRequest('Este pedido de transporte já não aceita propostas');
  }
  if (
    transportOrder.order.buyerId === transporterUserId ||
    isOrderSeller(transportOrder.order, transporterUserId)
  ) {
    throw ApiError.badRequest('Não pode propor transporte para o seu próprio pedido');
  }

  const existing = await prisma.transportProposal.findFirst({
    where: { transportOrderId, transporterId: transporter.id },
  });

  const proposal = existing
    ? await prisma.transportProposal.update({
        where: { id: existing.id },
        data: { price: input.price, message: input.message },
      })
    : await prisma.transportProposal.create({
        data: { transportOrderId, transporterId: transporter.id, price: input.price, message: input.message },
      });

  await recordAudit({
    userId: transporterUserId,
    action: 'TRANSPORT_PROPOSAL_SUBMITTED',
    entity: 'TransportProposal',
    entityId: proposal.id,
    result: 'SUCCESS',
    req,
  });

  return proposal;
}

export async function listProposals(transportOrderId: string, userId: string, role: UserRole) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isBuyer = transportOrder.order.buyerId === userId;
  const isSeller = isOrderSeller(transportOrder.order, userId);
  if (!isAdmin && !isBuyer && !isSeller) throw ApiError.forbidden('Sem acesso às propostas deste pedido');

  return transportOrder.proposals;
}

export async function acceptProposal(
  userId: string,
  role: UserRole,
  transportOrderId: string,
  proposalId: string,
  req: Request,
) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isSeller = isOrderSeller(transportOrder.order, userId);
  if (!isAdmin && !isSeller) throw ApiError.forbidden('Apenas o vendedor pode aceitar uma proposta de transporte');

  if (transportOrder.status !== TransportStatus.REQUESTED) {
    throw ApiError.badRequest('Este pedido de transporte já foi atribuído');
  }

  const proposal = transportOrder.proposals.find((p) => p.id === proposalId);
  if (!proposal) throw ApiError.notFound('Proposta não encontrada');

  const pickupOtp = generateOtp();
  const deliveryOtp = generateOtp();

  const updated = await prisma.$transaction(async (tx) => {
    await tx.transportProposal.update({ where: { id: proposalId }, data: { accepted: true } });

    return tx.transportOrder.update({
      where: { id: transportOrderId },
      data: {
        transporterId: proposal.transporterId,
        agreedPrice: proposal.price,
        status: TransportStatus.ASSIGNED,
        pickupOtp,
        deliveryOtp,
        statusHistory: { create: { status: TransportStatus.ASSIGNED, note: 'Proposta aceite pelo vendedor' } },
      },
      include: transportOrderInclude,
    });
  });

  await recordAudit({
    userId,
    action: 'TRANSPORT_PROPOSAL_ACCEPTED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    metadata: { proposalId },
    req,
  });

  return sanitizeOtps(updated, userId, isAdmin);
}

function assertAssignedTransporter(
  transportOrder: Awaited<ReturnType<typeof getTransportOrderOrThrow>>,
  userId: string,
) {
  if (!transportOrder.transporter || transportOrder.transporter.userId !== userId) {
    throw ApiError.forbidden('Apenas o transportador atribuído pode realizar esta acção');
  }
}

export async function transporterAcceptAssignment(transporterUserId: string, transportOrderId: string, req: Request) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  assertAssignedTransporter(transportOrder, transporterUserId);

  if (transportOrder.status !== TransportStatus.ASSIGNED) {
    throw ApiError.badRequest('Este pedido não está à espera de confirmação');
  }

  const updated = await prisma.transportOrder.update({
    where: { id: transportOrderId },
    data: { status: TransportStatus.ACCEPTED, statusHistory: { create: { status: TransportStatus.ACCEPTED } } },
    include: transportOrderInclude,
  });

  await recordAudit({
    userId: transporterUserId,
    action: 'TRANSPORT_ASSIGNMENT_ACCEPTED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(updated, transporterUserId);
}

export async function confirmPickup(transporterUserId: string, transportOrderId: string, otp: string, req: Request) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  assertAssignedTransporter(transportOrder, transporterUserId);

  if (transportOrder.status !== TransportStatus.ACCEPTED) {
    throw ApiError.badRequest('O transportador ainda não confirmou a atribuição');
  }
  if (transportOrder.pickupOtp !== otp) {
    throw ApiError.badRequest('Código de recolha inválido');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: transportOrder.orderId },
      data: {
        status: OrderStatus.PICKED_UP,
        statusHistory: { create: { status: OrderStatus.PICKED_UP, note: 'Recolhido pelo transportador' } },
      },
    });

    return tx.transportOrder.update({
      where: { id: transportOrderId },
      data: {
        status: TransportStatus.PICKED_UP,
        pickupAt: new Date(),
        statusHistory: { create: { status: TransportStatus.PICKED_UP } },
      },
      include: transportOrderInclude,
    });
  });

  await recordAudit({
    userId: transporterUserId,
    action: 'TRANSPORT_PICKUP_CONFIRMED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(updated, transporterUserId);
}

export async function startTransit(transporterUserId: string, transportOrderId: string, req: Request) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  assertAssignedTransporter(transportOrder, transporterUserId);

  if (transportOrder.status !== TransportStatus.PICKED_UP) {
    throw ApiError.badRequest('O transporte ainda não foi recolhido');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: transportOrder.orderId },
      data: {
        status: OrderStatus.IN_TRANSIT,
        statusHistory: { create: { status: OrderStatus.IN_TRANSIT, note: 'Em trânsito' } },
      },
    });

    return tx.transportOrder.update({
      where: { id: transportOrderId },
      data: { status: TransportStatus.IN_TRANSIT, statusHistory: { create: { status: TransportStatus.IN_TRANSIT } } },
      include: transportOrderInclude,
    });
  });

  await recordAudit({
    userId: transporterUserId,
    action: 'TRANSPORT_TRANSIT_STARTED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(updated, transporterUserId);
}

export async function confirmDelivery(transporterUserId: string, transportOrderId: string, otp: string, req: Request) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);
  assertAssignedTransporter(transportOrder, transporterUserId);

  if (transportOrder.status !== TransportStatus.IN_TRANSIT) {
    throw ApiError.badRequest('O transporte ainda não está em trânsito');
  }
  if (transportOrder.deliveryOtp !== otp) {
    throw ApiError.badRequest('Código de entrega inválido');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: transportOrder.orderId },
      data: {
        status: OrderStatus.DELIVERED,
        statusHistory: { create: { status: OrderStatus.DELIVERED, note: 'Entregue pelo transportador' } },
      },
    });

    return tx.transportOrder.update({
      where: { id: transportOrderId },
      data: {
        status: TransportStatus.DELIVERED,
        deliveredAt: new Date(),
        statusHistory: { create: { status: TransportStatus.DELIVERED } },
      },
      include: transportOrderInclude,
    });
  });

  await recordAudit({
    userId: transporterUserId,
    action: 'TRANSPORT_DELIVERY_CONFIRMED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(updated, transporterUserId);
}

export async function cancelTransportOrder(userId: string, role: UserRole, transportOrderId: string, req: Request) {
  const transportOrder = await getTransportOrderOrThrow(transportOrderId);

  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPPORT;
  const isBuyer = transportOrder.order.buyerId === userId;
  const isSeller = isOrderSeller(transportOrder.order, userId);
  const isAssignedTransporter = transportOrder.transporter?.userId === userId;

  if (!isAdmin && !isBuyer && !isSeller && !isAssignedTransporter) {
    throw ApiError.forbidden('Sem acesso a este pedido de transporte');
  }
  if (!CANCELLABLE_STATUSES.includes(transportOrder.status)) {
    throw ApiError.badRequest('Já não é possível cancelar este transporte');
  }

  const updated = await prisma.transportOrder.update({
    where: { id: transportOrderId },
    data: { status: TransportStatus.CANCELLED, statusHistory: { create: { status: TransportStatus.CANCELLED } } },
    include: transportOrderInclude,
  });

  await recordAudit({
    userId,
    action: 'TRANSPORT_ORDER_CANCELLED',
    entity: 'TransportOrder',
    entityId: transportOrderId,
    result: 'SUCCESS',
    req,
  });

  return sanitizeOtps(updated, userId, isAdmin);
}
