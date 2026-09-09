import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { listPendingPaymentsQuerySchema, orderIdParamSchema } from './payments.schema';
import {
  confirmPaymentHandler,
  listPendingPaymentsHandler,
  markPaymentSentHandler,
  rejectPaymentHandler,
} from './payments.controller';

export const paymentsRouter = Router();

paymentsRouter.use(authenticate);

paymentsRouter.get(
  '/pending',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(listPendingPaymentsQuerySchema),
  listPendingPaymentsHandler,
);
paymentsRouter.post('/:orderId/mark-sent', validate(orderIdParamSchema), markPaymentSentHandler);
paymentsRouter.post(
  '/:orderId/confirm',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(orderIdParamSchema),
  confirmPaymentHandler,
);
paymentsRouter.post(
  '/:orderId/reject',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(orderIdParamSchema),
  rejectPaymentHandler,
);
