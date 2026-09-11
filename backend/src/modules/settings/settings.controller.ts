import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as settingsService from './settings.service';

export const listSettingsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await settingsService.listSettings();
  res.status(200).json(settings);
});

export const getSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  const setting = await settingsService.getSetting(req.params.key);
  res.status(200).json(setting);
});

export const upsertSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const setting = await settingsService.upsertSetting(req.params.key, req.body.value, req.user.id, req);
  res.status(200).json(setting);
});

export const deleteSettingHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await settingsService.deleteSetting(req.params.key, req.user.id, req);
  res.status(204).send();
});
