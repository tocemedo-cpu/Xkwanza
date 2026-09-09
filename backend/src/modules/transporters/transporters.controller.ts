import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as transportersService from './transporters.service';

export const getMyTransporterProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await transportersService.getMyTransporterProfile(req.user.id);
  res.status(200).json(profile);
});

export const upsertMyTransporterProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await transportersService.upsertTransporterProfile(req.user.id, req.user.role, req.body);
  res.status(200).json(profile);
});

export const setAvailabilityHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await transportersService.setAvailability(req.user.id, req.user.role, req.body.isAvailable);
  res.status(200).json(profile);
});
