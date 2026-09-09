import { z } from 'zod';

export const upsertTransporterSchema = z.object({
  body: z.object({
    vehicleType: z.string().trim().min(2).max(60).optional(),
    vehiclePlate: z.string().trim().min(4).max(20).optional(),
  }),
});

export const setAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export type UpsertTransporterInput = z.infer<typeof upsertTransporterSchema>['body'];
