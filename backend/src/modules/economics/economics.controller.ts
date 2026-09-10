import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as economicsService from './economics.service';

export const getSellerStatsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const stats = await economicsService.getSellerStats(req.user.id);
  res.status(200).json(stats);
});

export const getTransporterStatsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const stats = await economicsService.getTransporterStats(req.user.id);
  res.status(200).json(stats);
});

export const getPlatformReportHandler = asyncHandler(async (_req: Request, res: Response) => {
  const report = await economicsService.getPlatformReport();
  res.status(200).json(report);
});
