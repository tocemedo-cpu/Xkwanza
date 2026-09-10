import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as producersService from './producers.service';

export const getMyProducerProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await producersService.getMyProducerProfile(req.user.id);
  res.status(200).json(profile);
});

export const upsertMyProducerProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await producersService.upsertProducerProfile(req.user.id, req.user.role, req.body);
  res.status(200).json(profile);
});
