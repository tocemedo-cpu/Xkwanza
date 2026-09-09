import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { recordAudit } from '../audit/audit.service';
import * as categoriesService from './categories.service';

export const listCategoriesHandler = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await categoriesService.listCategories();
  res.status(200).json(categories);
});

export const createCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body);
  await recordAudit({
    userId: req.user?.id,
    action: 'CATEGORY_CREATED',
    entity: 'Category',
    entityId: category.id,
    result: 'SUCCESS',
    req,
  });
  res.status(201).json(category);
});

export const updateCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  const category = await categoriesService.updateCategory(req.params.id, req.body);
  await recordAudit({
    userId: req.user?.id,
    action: 'CATEGORY_UPDATED',
    entity: 'Category',
    entityId: category.id,
    result: 'SUCCESS',
    req,
  });
  res.status(200).json(category);
});

export const deleteCategoryHandler = asyncHandler(async (req: Request, res: Response) => {
  await categoriesService.deleteCategory(req.params.id);
  await recordAudit({
    userId: req.user?.id,
    action: 'CATEGORY_DELETED',
    entity: 'Category',
    entityId: req.params.id,
    result: 'SUCCESS',
    req,
  });
  res.status(204).send();
});
