import { z } from 'zod';
import { RouteStatus, RouteStopStatus } from '@prisma/client';

export const createRouteSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3, 'Nome demasiado curto').max(120),
    plannedDate: z.coerce.date().optional(),
  }),
});

export const routeIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const updateRouteSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(3, 'Nome demasiado curto').max(120).optional(),
    plannedDate: z.coerce.date().nullable().optional(),
    status: z.nativeEnum(RouteStatus).optional(),
  }),
});

export const addStopSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    transportOrderId: z.string().uuid(),
  }),
});

export const stopParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), stopId: z.string().uuid() }),
});

export const updateStopSchema = z.object({
  params: z.object({ id: z.string().uuid(), stopId: z.string().uuid() }),
  body: z
    .object({
      sequence: z.number().int().min(1).optional(),
      status: z.nativeEnum(RouteStopStatus).optional(),
    })
    .refine((data) => data.sequence !== undefined || data.status !== undefined, {
      message: 'Indique pelo menos a sequência ou o estado a actualizar',
    }),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>['body'];
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>['body'];
export type AddStopInput = z.infer<typeof addStopSchema>['body'];
export type UpdateStopInput = z.infer<typeof updateStopSchema>['body'];
