import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upsertMerchantSchema } from './merchants.schema';
import { getMyMerchantProfileHandler, upsertMyMerchantProfileHandler } from './merchants.controller';

export const merchantsRouter = Router();

merchantsRouter.use(authenticate);

merchantsRouter.get('/me', getMyMerchantProfileHandler);
merchantsRouter.put('/me', validate(upsertMerchantSchema), upsertMyMerchantProfileHandler);
