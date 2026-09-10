import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upsertProducerSchema } from './producers.schema';
import { getMyProducerProfileHandler, upsertMyProducerProfileHandler } from './producers.controller';

export const producersRouter = Router();

producersRouter.use(authenticate);

producersRouter.get('/me', getMyProducerProfileHandler);
producersRouter.put('/me', validate(upsertProducerSchema), upsertMyProducerProfileHandler);
