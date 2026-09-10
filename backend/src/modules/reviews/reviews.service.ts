import { Request } from 'express';
import { OrderStatus, Prisma, ReviewTargetType } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { CreateReviewInput, ProductReviewsQuery } from './reviews.schema';

function isSellerOfOrder(order: { items: { product: { ownerId: string } }[] }, userId: string) {
  return order.items.some((item) => item.product.ownerId === userId);
}

async function recomputeProductRating(productId: string) {
  const { _avg, _count } = await prisma.review.aggregate({
    where: { targetType: ReviewTargetType.PRODUCT, productId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.product.update({
    where: { id: productId },
    data: { averageRating: _count > 0 ? new Prisma.Decimal(_avg.rating ?? 0).toDecimalPlaces(2) : 0 },
  });
}

async function recomputeTransporterRating(transporterUserId: string) {
  const { _avg, _count } = await prisma.review.aggregate({
    where: { targetType: ReviewTargetType.TRANSPORTER, targetUserId: transporterUserId },
    _avg: { rating: true },
    _count: true,
  });
  await prisma.transporter.update({
    where: { userId: transporterUserId },
    data: { averageRating: _count > 0 ? new Prisma.Decimal(_avg.rating ?? 0).toDecimalPlaces(2) : 0 },
  });
}

export async function createReview(authorId: string, input: CreateReviewInput, req: Request) {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      items: { include: { product: true } },
      transportOrder: { include: { transporter: true } },
    },
  });
  if (!order) throw ApiError.notFound('Pedido não encontrado');
  if (order.status !== OrderStatus.COMPLETED) throw ApiError.badRequest('Só pode avaliar pedidos concluídos');

  const isBuyer = order.buyerId === authorId;
  const isSeller = isSellerOfOrder(order, authorId);
  const isTransporter = order.transportOrder?.transporter?.userId === authorId;

  if (isBuyer) {
    if (input.targetType === ReviewTargetType.PRODUCT) {
      if (!input.productId || !order.items.some((item) => item.productId === input.productId)) {
        throw ApiError.badRequest('Produto inválido para este pedido');
      }
    } else if (input.targetType === ReviewTargetType.SELLER) {
      if (!input.targetUserId || !order.items.some((item) => item.product.ownerId === input.targetUserId)) {
        throw ApiError.badRequest('Vendedor inválido para este pedido');
      }
    } else if (input.targetType === ReviewTargetType.TRANSPORTER) {
      if (!input.targetUserId || order.transportOrder?.transporter?.userId !== input.targetUserId) {
        throw ApiError.badRequest('Este pedido não teve este transportador');
      }
    } else {
      throw ApiError.forbidden('Não pode avaliar um comprador');
    }
  } else if (isSeller || isTransporter) {
    if (input.targetType !== ReviewTargetType.BUYER || input.targetUserId !== order.buyerId) {
      throw ApiError.badRequest('Só pode avaliar o comprador deste pedido');
    }
  } else {
    throw ApiError.forbidden('Sem acesso a este pedido');
  }

  const existing = await prisma.review.findFirst({
    where: {
      authorId,
      orderId: input.orderId,
      targetType: input.targetType,
      productId: input.productId ?? null,
      targetUserId: input.targetUserId ?? null,
    },
  });
  if (existing) throw ApiError.conflict('Já avaliou isto para este pedido');

  const review = await prisma.review.create({
    data: {
      authorId,
      orderId: input.orderId,
      targetType: input.targetType,
      productId: input.productId,
      targetUserId: input.targetUserId,
      rating: input.rating,
      comment: input.comment,
    },
  });

  if (input.targetType === ReviewTargetType.PRODUCT && input.productId) {
    await recomputeProductRating(input.productId);
  }
  if (input.targetType === ReviewTargetType.TRANSPORTER && input.targetUserId) {
    await recomputeTransporterRating(input.targetUserId);
  }

  await recordAudit({
    userId: authorId,
    action: 'REVIEW_CREATED',
    entity: 'Review',
    entityId: review.id,
    result: 'SUCCESS',
    metadata: { targetType: input.targetType, orderId: input.orderId },
    req,
  });

  return review;
}

export async function listMyReviewsForOrder(authorId: string, orderId: string) {
  return prisma.review.findMany({ where: { authorId, orderId }, orderBy: { createdAt: 'asc' } });
}

// "Minhas avaliações" — todas as avaliações que o próprio utilizador escreveu, não só de um pedido.
export async function listMyReviews(authorId: string) {
  return prisma.review.findMany({
    where: { authorId },
    include: { product: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// Avaliações recebidas — vendedor/transportador vê o que disseram sobre eles (targetUserId).
export async function listReceivedReviews(targetUserId: string) {
  return prisma.review.findMany({
    where: { targetUserId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

// Uso administrativo — modera avaliações de qualquer utilizador (remove conteúdo impróprio).
export async function listAllReviewsForAdmin() {
  return prisma.review.findMany({
    include: { author: { select: { id: true, name: true } }, product: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
}

export async function deleteReview(adminId: string, id: string, req: Request) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw ApiError.notFound('Avaliação não encontrada');

  await prisma.review.delete({ where: { id } });

  if (review.targetType === ReviewTargetType.PRODUCT && review.productId) {
    await recomputeProductRating(review.productId);
  }
  if (review.targetType === ReviewTargetType.TRANSPORTER && review.targetUserId) {
    await recomputeTransporterRating(review.targetUserId);
  }

  await recordAudit({
    userId: adminId,
    action: 'REVIEW_REMOVED_BY_ADMIN',
    entity: 'Review',
    entityId: id,
    result: 'SUCCESS',
    req,
  });
}

export async function listProductReviews(productId: string, query: ProductReviewsQuery) {
  const where = { targetType: ReviewTargetType.PRODUCT, productId } as const;
  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: { author: { select: { id: true, name: true } } },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.review.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}
