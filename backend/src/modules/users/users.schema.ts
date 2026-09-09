import { z } from 'zod';
import { ANGOLA_PROVINCES } from '../../utils/angola';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
    activityType: z.string().trim().max(60).optional(),
  }),
});
