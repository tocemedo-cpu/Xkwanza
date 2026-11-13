import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { adminListOrdersQuerySchema, createOrderSchema, orderIdParamSchema, updateOrderStatusSchema } from './orders.schema';
import {
  checkoutHandler,
  getOrderHandler,
  listMyOrdersHandler,
  listOrdersForAdminHandler,
  listReceivedOrdersHandler,
  updateOrderStatusHandler,
} from './orders.controller';

export const ordersRouter = Router();

ordersRouter.use(authenticate);

// Checkout é uma acção de comprador — Comprador compra sempre; Comerciante também compra
// (de produtores/fornecedores, para repor o próprio stock). Produtor/Transportador não compram.
ordersRouter.post(
  '/',
  requireRole(UserRole.BUYER, UserRole.MERCHANT),
  validate(createOrderSchema),
  checkoutHandler,
);
ordersRouter.get('/mine', listMyOrdersHandler);
ordersRouter.get('/received', listReceivedOrdersHandler);
ordersRouter.get(
  '/admin',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(adminListOrdersQuerySchema),
  listOrdersForAdminHandler,
);
ordersRouter.get('/:id', validate(orderIdParamSchema), getOrderHandler);
ordersRouter.patch('/:id/status', validate(updateOrderStatusSchema), updateOrderStatusHandler);
