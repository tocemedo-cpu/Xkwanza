import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { productIdParamSchema } from './favorites.schema';
import { addFavoriteHandler, listMyFavoritesHandler, removeFavoriteHandler } from './favorites.controller';

export const favoritesRouter = Router();

favoritesRouter.use(authenticate);

favoritesRouter.get('/', listMyFavoritesHandler);
favoritesRouter.put('/:productId', validate(productIdParamSchema), addFavoriteHandler);
favoritesRouter.delete('/:productId', validate(productIdParamSchema), removeFavoriteHandler);
