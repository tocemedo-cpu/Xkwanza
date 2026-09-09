import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createReviewSchema, orderIdParamSchema, productIdParamSchema } from './reviews.schema';
import { createReviewHandler, listMyReviewsForOrderHandler, listProductReviewsHandler } from './reviews.controller';

export const reviewsRouter = Router();

// Pública — mostrada na página do produto sem exigir sessão.
reviewsRouter.get('/product/:productId', validate(productIdParamSchema), listProductReviewsHandler);

reviewsRouter.use(authenticate);
reviewsRouter.post('/', validate(createReviewSchema), createReviewHandler);
reviewsRouter.get('/mine/:orderId', validate(orderIdParamSchema), listMyReviewsForOrderHandler);
