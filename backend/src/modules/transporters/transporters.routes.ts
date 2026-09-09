import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { setAvailabilitySchema, upsertTransporterSchema } from './transporters.schema';
import {
  getMyTransporterProfileHandler,
  setAvailabilityHandler,
  upsertMyTransporterProfileHandler,
} from './transporters.controller';

export const transportersRouter = Router();

transportersRouter.use(authenticate);

transportersRouter.get('/me', getMyTransporterProfileHandler);
transportersRouter.put('/me', validate(upsertTransporterSchema), upsertMyTransporterProfileHandler);
transportersRouter.patch('/me/availability', validate(setAvailabilitySchema), setAvailabilityHandler);
