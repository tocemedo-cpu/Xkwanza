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
  updateCategoryHandler,
} from './categories.controller';

export const categoriesRouter = Router();

// Pública — necessária para navegação e filtros do marketplace sem sessão.
categoriesRouter.get('/', listCategoriesHandler);

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
