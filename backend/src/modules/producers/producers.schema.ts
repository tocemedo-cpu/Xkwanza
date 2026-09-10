import { z } from 'zod';

export const upsertProducerSchema = z.object({
  body: z.object({
    productionLocation: z.string().trim().min(2).max(160).optional(),
    businessName: z.string().trim().min(2).max(160).optional(),
    productCategories: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    productsProduced: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    productionCapacity: z.string().trim().min(1).max(60).optional(),
    productionUnit: z.string().trim().min(1).max(40).optional(),
    referencePrice: z.string().trim().min(1).max(80).optional(),
    availability: z.string().trim().min(1).max(160).optional(),
    description: z.string().trim().min(1).max(2000).optional(),
  }),
});

export type UpsertProducerInput = z.infer<typeof upsertProducerSchema>['body'];
