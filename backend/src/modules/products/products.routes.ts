import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  addProductPhotoSchema,
  createProductSchema,
  listProductsQuerySchema,
  productIdParamSchema,
  productPhotoParamSchema,
  updateProductSchema,
} from './products.schema';
import {
  addProductPhotoHandler,
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  listMyProductsHandler,
  listProductsHandler,
  publishProductHandler,
  removeProductPhotoHandler,
  unpublishProductHandler,
  updateProductHandler,
} from './products.controller';

export const productsRouter = Router();

// Rotas públicas — pesquisa e detalhe não exigem sessão.
productsRouter.get('/', validate(listProductsQuerySchema), listProductsHandler);
productsRouter.get('/mine', authenticate, listMyProductsHandler);
productsRouter.get('/:id', validate(productIdParamSchema), getProductHandler);

productsRouter.post('/', authenticate, validate(createProductSchema), createProductHandler);
productsRouter.patch('/:id', authenticate, validate(updateProductSchema), updateProductHandler);
productsRouter.delete('/:id', authenticate, validate(productIdParamSchema), deleteProductHandler);

productsRouter.post('/:id/publish', authenticate, validate(productIdParamSchema), publishProductHandler);
productsRouter.post('/:id/unpublish', authenticate, validate(productIdParamSchema), unpublishProductHandler);

productsRouter.post('/:id/photos', authenticate, validate(addProductPhotoSchema), addProductPhotoHandler);
productsRouter.delete(
  '/:id/photos/:photoId',
  authenticate,
  validate(productPhotoParamSchema),
  removeProductPhotoHandler,
);
