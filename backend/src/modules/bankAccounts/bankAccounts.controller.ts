import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as bankAccountsService from './bankAccounts.service';

export const listBankAccountsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const accounts = await bankAccountsService.listBankAccounts(req.user.id);
  res.status(200).json(accounts);
});

export const createBankAccountHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const account = await bankAccountsService.createBankAccount(req.user.id, req.body);
  res.status(201).json(account);
});

export const deleteBankAccountHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await bankAccountsService.deleteBankAccount(req.user.id, req.params.id);
  res.status(204).send();
});
