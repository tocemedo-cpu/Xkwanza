import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as merchantsService from './merchants.service';

export const getMyMerchantProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await merchantsService.getMyMerchantProfile(req.user.id);
  res.status(200).json(profile);
});

export const upsertMyMerchantProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await merchantsService.upsertMerchantProfile(req.user.id, req.user.role, req.body);
  res.status(200).json(profile);
});
