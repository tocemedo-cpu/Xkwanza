import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import { uploadBannerImage } from '../../storage/productPhotoStorage';
import * as bannersService from './banners.service';

export const listActiveBannersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await bannersService.listActiveBanners();
  res.status(200).json(banners);
});

export const listAllBannersHandler = asyncHandler(async (_req: Request, res: Response) => {
  const banners = await bannersService.listAllBanners();
  res.status(200).json(banners);
});

export const createBannerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const banner = await bannersService.createBanner(req.user.id, req.body, req);
  res.status(201).json(banner);
});

export const updateBannerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const banner = await bannersService.updateBanner(req.user.id, req.params.id, req.body, req);
  res.status(200).json(banner);
});

export const deleteBannerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await bannersService.deleteBanner(req.user.id, req.params.id, req);
  res.status(204).send();
});

export const uploadBannerImageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (!req.file) throw ApiError.badRequest('Ficheiro de imagem em falta (campo "file")');

  const url = await uploadBannerImage({ buffer: req.file.buffer, mimeType: req.file.mimetype });
  res.status(201).json({ url });
});
