import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as favoritesService from './favorites.service';

export const listMyFavoritesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const products = await favoritesService.listMyFavorites(req.user.id);
  res.status(200).json(products);
});

export const addFavoriteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await favoritesService.addFavorite(req.user.id, req.params.productId);
  res.status(204).send();
});

export const removeFavoriteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await favoritesService.removeFavorite(req.user.id, req.params.productId);
  res.status(204).send();
});
