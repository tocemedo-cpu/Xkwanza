import { z } from 'zod';

export const orderIdParamSchema = z.object({
  params: z.object({ orderId: z.string().uuid() }),
});

// Payload mínimo genérico — um provedor real tem o seu próprio formato; quando a integração
// real for implementada, este schema deve ser ajustado ao contrato desse provedor.
export const gatewayWebhookSchema = z.object({
  body: z.object({
    externalRef: z.string().min(1),
    status: z.enum(['PAID', 'FAILED']),
  }),
});

export const listPendingPaymentsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export type ListPendingPaymentsQuery = z.infer<typeof listPendingPaymentsQuerySchema>['query'];
