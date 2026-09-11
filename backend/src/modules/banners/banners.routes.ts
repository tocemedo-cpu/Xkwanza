import { Router } from 'express';
import multer from 'multer';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { MAX_PHOTO_BYTES } from '../../storage/productPhotoStorage';
import { bannerIdParamSchema, createBannerSchema, updateBannerSchema } from './banners.schema';
import {
  createBannerHandler,
  deleteBannerHandler,
  listActiveBannersHandler,
  listAllBannersHandler,
  updateBannerHandler,
  uploadBannerImageHandler,
} from './banners.controller';

const imageUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_PHOTO_BYTES } });

export const bannersRouter = Router();

// Rota pública — a homepage consome apenas os banners activos.
bannersRouter.get('/active', listActiveBannersHandler);

// Restantes rotas são exclusivas de ADMIN/SUPPORT.
bannersRouter.get('/', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPPORT), listAllBannersHandler);
bannersRouter.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(createBannerSchema),
  createBannerHandler,
);
bannersRouter.patch(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(updateBannerSchema),
  updateBannerHandler,
);
bannersRouter.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(bannerIdParamSchema),
  deleteBannerHandler,
);
bannersRouter.post(
  '/upload',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  imageUpload.single('file'),
  uploadBannerImageHandler,
);
