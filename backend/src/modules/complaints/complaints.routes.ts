import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  addComplaintMessageSchema,
  complaintIdParamSchema,
  createComplaintSchema,
  listComplaintsQuerySchema,
  updateComplaintStatusSchema,
} from './complaints.schema';
import {
  addComplaintMessageHandler,
  createComplaintHandler,
  getComplaintHandler,
  listComplaintsHandler,
  listMyComplaintsHandler,
  updateComplaintStatusHandler,
} from './complaints.controller';

export const complaintsRouter = Router();

complaintsRouter.use(authenticate);

complaintsRouter.post('/', validate(createComplaintSchema), createComplaintHandler);
complaintsRouter.get('/mine', listMyComplaintsHandler);
complaintsRouter.get('/', requireRole(UserRole.ADMIN, UserRole.SUPPORT), validate(listComplaintsQuerySchema), listComplaintsHandler);
complaintsRouter.get('/:id', validate(complaintIdParamSchema), getComplaintHandler);
complaintsRouter.post('/:id/messages', validate(addComplaintMessageSchema), addComplaintMessageHandler);
complaintsRouter.patch(
  '/:id/status',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(updateComplaintStatusSchema),
  updateComplaintStatusHandler,
);
