import { z } from 'zod';
import { ANGOLA_PROVINCES } from '../../utils/angola';

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    name: z.string().trim().min(2).max(160),
    description: z.string().trim().min(10).max(4000),
    price: z.number().positive().max(999_999_999),
    unit: z.string().trim().min(1).max(30),
    stock: z.number().int().min(0).default(0),
    weightKg: z.number().positive().optional(),
    origin: z.string().trim().max(160).optional(),
    province: z.enum(ANGOLA_PROVINCES),
    municipality: z.string().trim().min(2).max(120),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().min(10).max(4000).optional(),
    price: z.number().positive().max(999_999_999).optional(),
    unit: z.string().trim().min(1).max(30).optional(),
    stock: z.number().int().min(0).optional(),
    weightKg: z.number().positive().optional(),
    origin: z.string().trim().max(160).optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().max(160).optional(),
    categoryId: z.string().uuid().optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    ownerId: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const addProductPhotoSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    url: z.string().trim().url().max(2048),
  }),
});

export const productPhotoParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), photoId: z.string().uuid() }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];
