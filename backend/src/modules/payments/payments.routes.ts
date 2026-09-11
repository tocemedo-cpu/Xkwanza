import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { gatewayWebhookSchema, listPendingPaymentsQuerySchema, orderIdParamSchema } from './payments.schema';
import {
  confirmPaymentHandler,
  gatewayWebhookHandler,
  listPendingPaymentsHandler,
  markPaymentSentHandler,
  rejectPaymentHandler,
} from './payments.controller';

export const paymentsRouter = Router();

// Chamado pelo provedor externo do gateway — nunca autenticado por sessão (ver payment.adapter.ts
// verifyWebhookSignature). Tem de ficar antes do `authenticate` abaixo.
paymentsRouter.post('/gateway/webhook', validate(gatewayWebhookSchema), gatewayWebhookHandler);

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
