import { z } from 'zod';
import { ReviewTargetType } from '@prisma/client';

export const createReviewSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
    targetType: z.nativeEnum(ReviewTargetType),
    productId: z.string().uuid().optional(),
    targetUserId: z.string().uuid().optional(),
    rating: z.number().int().min(1).max(5),
    comment: z.string().trim().max(1000).optional(),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({ orderId: z.string().uuid() }),
});

export const productIdParamSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const reviewIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>['body'];
export type ProductReviewsQuery = z.infer<typeof productIdParamSchema>['query'];
