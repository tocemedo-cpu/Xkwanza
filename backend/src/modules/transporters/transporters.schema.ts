import { z } from 'zod';
import { TransporterCategory } from '@prisma/client';

export const upsertTransporterSchema = z.object({
  body: z.object({
    transporterCategory: z.nativeEnum(TransporterCategory).optional(),
    vehicleType: z.string().trim().min(2).max(60).optional(),
    vehiclePlate: z.string().trim().min(4).max(20).optional(),
    cargoCapacity: z.string().trim().min(1).max(60).optional(),
    cargoType: z.string().trim().min(1).max(160).optional(),
    serviceAreas: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    servicePrice: z.string().trim().min(1).max(80).optional(),
  }),
});

export const setAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.boolean(),
  }),
});

export type UpsertTransporterInput = z.infer<typeof upsertTransporterSchema>['body'];
