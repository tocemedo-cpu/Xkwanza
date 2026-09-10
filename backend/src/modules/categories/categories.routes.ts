import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { categoryIdParamSchema, createCategorySchema, updateCategorySchema } from './categories.schema';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  listCategoriesHandler,
  seedDefaultCategoriesHandler,
  updateCategoryHandler,
} from './categories.controller';

export const categoriesRouter = Router();

// Pública — necessária para navegação e filtros do marketplace sem sessão.
categoriesRouter.get('/', listCategoriesHandler);

// Ponto de partida para uma base de dados sem nenhuma categoria — nunca há seed automático,
// por isso isto fica disponível como acção manual de administração (idempotente).
categoriesRouter.post('/seed-defaults', authenticate, requireRole(UserRole.ADMIN), seedDefaultCategoriesHandler);

categoriesRouter.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(createCategorySchema),
  createCategoryHandler,
);
categoriesRouter.patch(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(updateCategorySchema),
  updateCategoryHandler,
);
categoriesRouter.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN),
  validate(categoryIdParamSchema),
  deleteCategoryHandler,
);
