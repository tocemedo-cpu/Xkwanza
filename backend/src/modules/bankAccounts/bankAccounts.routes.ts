import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { bankAccountIdParamSchema, createBankAccountSchema } from './bankAccounts.schema';
import { createBankAccountHandler, deleteBankAccountHandler, listBankAccountsHandler } from './bankAccounts.controller';

export const bankAccountsRouter = Router();

bankAccountsRouter.use(authenticate);

bankAccountsRouter.get('/', listBankAccountsHandler);
bankAccountsRouter.post('/', validate(createBankAccountSchema), createBankAccountHandler);
bankAccountsRouter.delete('/:id', validate(bankAccountIdParamSchema), deleteBankAccountHandler);
