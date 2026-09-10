import { z } from 'zod';
import { SelfDeclaredFormalizationState } from '@prisma/client';

export const upsertMerchantSchema = z.object({
  body: z.object({
    businessName: z.string().trim().min(2).max(160).optional(),
    businessLocation: z.string().trim().min(2).max(160).optional(),
    productCategories: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    productsSold: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    formalizationState: z.nativeEnum(SelfDeclaredFormalizationState).optional(),
  }),
});

export type UpsertMerchantInput = z.infer<typeof upsertMerchantSchema>['body'];
