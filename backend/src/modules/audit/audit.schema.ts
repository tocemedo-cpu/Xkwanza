import { z } from 'zod';

export const listAuditLogsQuerySchema = z.object({
  query: z.object({
    entity: z.string().trim().max(60).optional(),
    action: z.string().trim().max(60).optional(),
    userId: z.string().uuid().optional(),
    result: z.enum(['SUCCESS', 'FAILURE']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(50),
  }),
});

export type ListAuditLogsQuery = z.infer<typeof listAuditLogsQuerySchema>['query'];
