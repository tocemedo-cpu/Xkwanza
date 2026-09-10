import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { setAvailabilitySchema, upsertTransporterSchema } from './transporters.schema';
import {
  getMyTransporterProfileHandler,
  listTransportersForAdminHandler,
  setAvailabilityHandler,
  upsertMyTransporterProfileHandler,
} from './transporters.controller';

export const transportersRouter = Router();

transportersRouter.use(authenticate);

transportersRouter.get('/me', getMyTransporterProfileHandler);
transportersRouter.put('/me', validate(upsertTransporterSchema), upsertMyTransporterProfileHandler);
transportersRouter.patch('/me/availability', validate(setAvailabilitySchema), setAvailabilityHandler);
transportersRouter.get('/admin', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listTransportersForAdminHandler);
