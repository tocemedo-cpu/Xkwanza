import { z } from 'zod';
import { ANGOLA_PROVINCES } from '../../utils/angola';

export const createAddressSchema = z.object({
  body: z.object({
    label: z.string().trim().max(60).optional(),
    province: z.enum(ANGOLA_PROVINCES),
    municipality: z.string().trim().min(2).max(120),
    locality: z.string().trim().max(120).optional(),
    reference: z.string().trim().max(255).optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const updateAddressSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    label: z.string().trim().max(60).optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
    locality: z.string().trim().max(120).optional(),
    reference: z.string().trim().max(255).optional(),
    isDefault: z.boolean().optional(),
  }),
});

export const addressIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>['body'];
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>['body'];
