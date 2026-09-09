import { z } from 'zod';

export const orderIdParamSchema = z.object({
  params: z.object({ orderId: z.string().uuid() }),
});

export const listPendingPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type ListPendingPaymentsQuery = z.infer<typeof listPendingPaymentsQuerySchema>['query'];
