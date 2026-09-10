import { z } from 'zod';
import { DeliveryOption, ListingType, ProductStatus } from '@prisma/client';
import { ANGOLA_PROVINCES } from '../../utils/angola';

const baseCreateFields = {
  categoryId: z.string().uuid(),
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().min(10).max(4000),
  price: z.number().positive().max(999_999_999),
  isEstimatedPrice: z.boolean().default(false),
};

const createProductListingSchema = z.object({
  ...baseCreateFields,
  listingType: z.literal(ListingType.PRODUCT),
  unit: z.string().trim().min(1).max(30),
  stock: z.number().int().min(0).default(0),
  weightKg: z.number().positive().optional(),
  origin: z.string().trim().max(160).optional(),
  province: z.enum(ANGOLA_PROVINCES),
  municipality: z.string().trim().min(2).max(120),
  deliveryOption: z.nativeEnum(DeliveryOption),
});

const createServiceListingSchema = z.object({
  ...baseCreateFields,
  listingType: z.literal(ListingType.SERVICE),
  serviceArea: z.string().trim().min(2).max(300),
  availability: z.string().trim().min(2).max(300),
  contact: z.string().trim().min(3).max(160),
});

export const createProductSchema = z.object({
  body: z.discriminatedUnion('listingType', [createProductListingSchema, createServiceListingSchema]),
});

// Actualização — mantém-se num único objecto flexível (em vez do discriminated union da
// criação): só se alteram alguns campos de cada vez, e o listingType de um anúncio não muda
// depois de criado.
export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    categoryId: z.string().uuid().optional(),
    name: z.string().trim().min(2).max(160).optional(),
    description: z.string().trim().min(10).max(4000).optional(),
    price: z.number().positive().max(999_999_999).optional(),
    isEstimatedPrice: z.boolean().optional(),
    unit: z.string().trim().min(1).max(30).optional(),
    stock: z.number().int().min(0).optional(),
    weightKg: z.number().positive().optional(),
    origin: z.string().trim().max(160).optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
    deliveryOption: z.nativeEnum(DeliveryOption).optional(),
    serviceArea: z.string().trim().min(2).max(300).optional(),
    availability: z.string().trim().min(2).max(300).optional(),
    contact: z.string().trim().min(3).max(160).optional(),
  }),
});

export const productIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().max(160).optional(),
    categoryId: z.string().uuid().optional(),
    listingType: z.nativeEnum(ListingType).optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
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

// Moderação — administração vê/gere anúncios de qualquer dono, independentemente do estado.
export const adminListProductsQuerySchema = z.object({
  query: z.object({
    search: z.string().trim().max(160).optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    listingType: z.nativeEnum(ListingType).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const moderateProductSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.enum([ProductStatus.UNPUBLISHED, ProductStatus.REMOVED] as const),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>['query'];
export type AdminListProductsQuery = z.infer<typeof adminListProductsQuerySchema>['query'];
export type ModerateProductInput = z.infer<typeof moderateProductSchema>['body'];
