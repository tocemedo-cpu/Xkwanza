import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { creditWalletSchema } from './wallet.schema';
import { creditWalletHandler, getMyWalletHandler } from './wallet.controller';

export const walletRouter = Router();

walletRouter.use(authenticate);

walletRouter.get('/me', getMyWalletHandler);
walletRouter.post('/:userId/credit', requireRole(UserRole.ADMIN), validate(creditWalletSchema), creditWalletHandler);
