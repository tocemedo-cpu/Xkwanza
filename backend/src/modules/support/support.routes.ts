import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  addMessageSchema,
  createTicketSchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
  updateTicketStatusSchema,
} from './support.schema';
import {
  addMessageHandler,
  createTicketHandler,
  getTicketHandler,
  listMyTicketsHandler,
  listTicketsHandler,
  updateTicketStatusHandler,
} from './support.controller';

export const supportRouter = Router();

supportRouter.use(authenticate);

supportRouter.post('/tickets', validate(createTicketSchema), createTicketHandler);
supportRouter.get('/tickets/mine', listMyTicketsHandler);
supportRouter.get('/tickets', requireRole(UserRole.ADMIN, UserRole.SUPPORT), validate(listTicketsQuerySchema), listTicketsHandler);
supportRouter.get('/tickets/:id', validate(ticketIdParamSchema), getTicketHandler);
supportRouter.post('/tickets/:id/messages', validate(addMessageSchema), addMessageHandler);
supportRouter.patch(
  '/tickets/:id/status',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(updateTicketStatusSchema),
  updateTicketStatusHandler,
);
