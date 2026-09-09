import { Request } from 'express';
import { PaymentMethod, PaymentStatus, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { ListPendingPaymentsQuery } from './payments.schema';

const paymentInclude = { statusHistory: { orderBy: { createdAt: 'asc' } } } satisfies Prisma.PaymentInclude;

async function getOrderWithPaymentOrThrow(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { payment: true } });
  if (!order || !order.payment) throw ApiError.notFound('Pagamento não encontrado');
  return order;
}

// O comprador assinala que efectuou a transferência/depósito — não confirma o pagamento em si,
// apenas avisa o suporte para verificar. Não existe gateway bancário real ligado (Fase 8/9).
export async function markPaymentSent(buyerId: string, orderId: string, req: Request) {
  const order = await getOrderWithPaymentOrThrow(orderId);
  if (order.buyerId !== buyerId) throw ApiError.forbidden('Sem acesso a este pagamento');

  if (order.payment!.method !== PaymentMethod.BANK_TRANSFER && order.payment!.method !== PaymentMethod.PAYMENT_REFERENCE) {
    throw ApiError.badRequest('Este método de pagamento não necessita de confirmação manual');
  }
  if (order.payment!.status !== PaymentStatus.PENDING) {
    throw ApiError.badRequest('Este pagamento já foi processado');
  }

  const updated = await prisma.payment.update({
    where: { orderId },
    data: {
      status: PaymentStatus.PROCESSING,
      statusHistory: { create: { status: PaymentStatus.PROCESSING, note: 'Comprador assinalou pagamento efectuado' } },
    },
    include: paymentInclude,
  });

  await recordAudit({
    userId: buyerId,
    action: 'PAYMENT_MARKED_SENT',
    entity: 'Payment',
    entityId: updated.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

// Confirmação manual do suporte/administração — representa a verificação humana do extracto
// bancário real. Nunca uma integração automática com o banco (não existe até haver acordo formal).
export async function confirmPayment(adminId: string, orderId: string, req: Request) {
  const order = await getOrderWithPaymentOrThrow(orderId);
  if (order.payment!.status !== PaymentStatus.PENDING && order.payment!.status !== PaymentStatus.PROCESSING) {
    throw ApiError.badRequest('Este pagamento já foi processado');
  }

  const updated = await prisma.payment.update({
    where: { orderId },
    data: {
      status: PaymentStatus.PAID,
      custodyHeld: true,
      statusHistory: { create: { status: PaymentStatus.PAID, note: 'Depósito confirmado manualmente pelo suporte' } },
    },
    include: paymentInclude,
  });

  await recordAudit({
    userId: adminId,
    action: 'PAYMENT_CONFIRMED',
    entity: 'Payment',
    entityId: updated.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function rejectPayment(adminId: string, orderId: string, req: Request) {
  const order = await getOrderWithPaymentOrThrow(orderId);
  if (order.payment!.status !== PaymentStatus.PENDING && order.payment!.status !== PaymentStatus.PROCESSING) {
    throw ApiError.badRequest('Este pagamento já foi processado');
  }

  const updated = await prisma.payment.update({
    where: { orderId },
    data: {
      status: PaymentStatus.FAILED,
      statusHistory: { create: { status: PaymentStatus.FAILED, note: 'Depósito não confirmado pelo suporte' } },
    },
    include: paymentInclude,
  });

  await recordAudit({
    userId: adminId,
    action: 'PAYMENT_REJECTED',
    entity: 'Payment',
    entityId: updated.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function listPendingPayments(query: ListPendingPaymentsQuery) {
  const where: Prisma.OrderWhereInput = {
    payment: { status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] } },
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        buyer: { select: { id: true, name: true, phone: true } },
        payment: { include: paymentInclude },
      },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'asc' },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}
