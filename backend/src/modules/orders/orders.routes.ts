import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createOrderSchema, orderIdParamSchema, updateOrderStatusSchema } from './orders.schema';
import {
  checkoutHandler,
  getOrderHandler,
  listMyOrdersHandler,
  listReceivedOrdersHandler,
  updateOrderStatusHandler,
} from './orders.controller';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

ordersRouter.post('/', validate(createOrderSchema), checkoutHandler);
ordersRouter.get('/mine', listMyOrdersHandler);
ordersRouter.get('/received', listReceivedOrdersHandler);
ordersRouter.get('/:id', validate(orderIdParamSchema), getOrderHandler);
ordersRouter.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatusHandler);
