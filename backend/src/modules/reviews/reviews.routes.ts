import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { createReviewSchema, orderIdParamSchema, productIdParamSchema, reviewIdParamSchema } from './reviews.schema';
import {
  createReviewHandler,
  deleteReviewHandler,
  listAllReviewsForAdminHandler,
  listMyReviewsForOrderHandler,
  listMyReviewsHandler,
  listProductReviewsHandler,
  listReceivedReviewsHandler,
} from './reviews.controller';

export const reviewsRouter = Router();

// Pública — mostrada na página do produto sem exigir sessão.
reviewsRouter.get('/product/:productId', validate(productIdParamSchema), listProductReviewsHandler);

reviewsRouter.use(authenticate);
reviewsRouter.post('/', validate(createReviewSchema), createReviewHandler);
reviewsRouter.get('/mine/:orderId', validate(orderIdParamSchema), listMyReviewsForOrderHandler);
reviewsRouter.get('/mine', listMyReviewsHandler);
reviewsRouter.get('/received', listReceivedReviewsHandler);
reviewsRouter.get('/admin', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listAllReviewsForAdminHandler);
reviewsRouter.delete(
  '/:id',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(reviewIdParamSchema),
  deleteReviewHandler,
);
