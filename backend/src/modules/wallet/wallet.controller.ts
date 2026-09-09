import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as walletService from './wallet.service';

export const getMyWalletHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const wallet = await walletService.getMyWallet(req.user.id);
  res.status(200).json(wallet);
});

export const creditWalletHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const wallet = await walletService.creditWallet(req.user.id, req.params.userId, req.body.amount, req.body.note, req);
  res.status(200).json(wallet);
});
