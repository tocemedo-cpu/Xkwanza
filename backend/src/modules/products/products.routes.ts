import { Router } from 'express';
import multer from 'multer';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { MAX_PHOTO_BYTES } from '../../storage/productPhotoStorage';
import {
  addProductPhotoSchema,
  adminListProductsQuerySchema,
  createProductSchema,
  listProductsQuerySchema,
  moderateProductSchema,
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
  listProductsForAdminHandler,
  listProductsHandler,
  moderateProductHandler,
  publishProductHandler,
  removeProductPhotoHandler,
  unpublishProductHandler,
  updateProductHandler,
  uploadProductPhotoHandler,
} from './products.controller';

const photoUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES } });

export const productsRouter = Router();

// Rotas públicas — pesquisa e detalhe não exigem sessão.
productsRouter.get('/', validate(listProductsQuerySchema), listProductsHandler);
productsRouter.get('/mine', authenticate, listMyProductsHandler);
productsRouter.get(
  '/admin',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(adminListProductsQuerySchema),
  listProductsForAdminHandler,
);
productsRouter.get('/:id', validate(productIdParamSchema), getProductHandler);

productsRouter.post('/', authenticate, validate(createProductSchema), createProductHandler);
productsRouter.patch('/:id', authenticate, validate(updateProductSchema), updateProductHandler);
productsRouter.delete('/:id', authenticate, validate(productIdParamSchema), deleteProductHandler);

productsRouter.post('/:id/publish', authenticate, validate(productIdParamSchema), publishProductHandler);
productsRouter.post('/:id/unpublish', authenticate, validate(productIdParamSchema), unpublishProductHandler);
productsRouter.patch(
  '/:id/moderate',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(moderateProductSchema),
  moderateProductHandler,
);

productsRouter.post('/:id/photos', authenticate, validate(addProductPhotoSchema), addProductPhotoHandler);
productsRouter.post(
  '/:id/photos/upload',
  authenticate,
  validate(productIdParamSchema),
  photoUpload.single('file'),
  uploadProductPhotoHandler,
);
productsRouter.delete(
  '/:id/photos/:photoId',
  authenticate,
  validate(productPhotoParamSchema),
  removeProductPhotoHandler,
);
