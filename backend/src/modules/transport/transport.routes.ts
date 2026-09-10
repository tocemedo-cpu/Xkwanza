import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  acceptProposalParamSchema,
  createProposalSchema,
  createTransportOrderSchema,
  listOpenTransportOrdersQuerySchema,
  otpSchema,
  transportOrderIdParamSchema,
} from './transport.schema';
import {
  acceptProposalHandler,
  cancelTransportOrderHandler,
  confirmDeliveryHandler,
  confirmPickupHandler,
  createProposalHandler,
  getTransportOrderHandler,
  listMyAssignedJobsHandler,
  listMyProposalsHandler,
  listOpenTransportOrdersHandler,
  listProposalsHandler,
  listTransportOrdersForAdminHandler,
  requestTransportHandler,
  startTransitHandler,
  transporterAcceptAssignmentHandler,
} from './transport.controller';

export const transportRouter = Router();

transportRouter.use(authenticate);

transportRouter.post('/', validate(createTransportOrderSchema), requestTransportHandler);
transportRouter.get('/open', validate(listOpenTransportOrdersQuerySchema), listOpenTransportOrdersHandler);
transportRouter.get('/mine', listMyAssignedJobsHandler);
transportRouter.get('/my-proposals', listMyProposalsHandler);
transportRouter.get('/admin', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listTransportOrdersForAdminHandler);

transportRouter.get('/:id', validate(transportOrderIdParamSchema), getTransportOrderHandler);
transportRouter.get('/:id/proposals', validate(transportOrderIdParamSchema), listProposalsHandler);
transportRouter.post('/:id/proposals', validate(createProposalSchema), createProposalHandler);
transportRouter.post('/:id/proposals/:proposalId/accept', validate(acceptProposalParamSchema), acceptProposalHandler);

transportRouter.post('/:id/accept', validate(transportOrderIdParamSchema), transporterAcceptAssignmentHandler);
transportRouter.post('/:id/confirm-pickup', validate(otpSchema), confirmPickupHandler);
transportRouter.post('/:id/start-transit', validate(transportOrderIdParamSchema), startTransitHandler);
transportRouter.post('/:id/confirm-delivery', validate(otpSchema), confirmDeliveryHandler);
transportRouter.post('/:id/cancel', validate(transportOrderIdParamSchema), cancelTransportOrderHandler);
