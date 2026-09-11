import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { settingKeyParamSchema, upsertSettingSchema } from './settings.schema';
import {
  deleteSettingHandler,
  getSettingHandler,
  listSettingsHandler,
  upsertSettingHandler,
} from './settings.controller';

export const settingsRouter = Router();

// Todas as rotas são exclusivas de ADMIN — não há leitura pública de configurações da plataforma.
settingsRouter.get('/', authenticate, requireRole(UserRole.ADMIN), listSettingsHandler);
settingsRouter.get('/:key', authenticate, requireRole(UserRole.ADMIN), validate(settingKeyParamSchema), getSettingHandler);
settingsRouter.put('/:key', authenticate, requireRole(UserRole.ADMIN), validate(upsertSettingSchema), upsertSettingHandler);
settingsRouter.delete(
  '/:key',
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(settingKeyParamSchema),
  deleteSettingHandler,
);
