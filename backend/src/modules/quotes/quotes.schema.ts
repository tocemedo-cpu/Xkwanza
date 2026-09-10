import { z } from 'zod';

export const createQuoteRequestSchema = z.object({
  body: z.object({
    productId: z.string().uuid().optional(),
    description: z.string().trim().min(10, 'Descreve com mais detalhe o que precisas').max(2000),
    quantity: z.number().positive().max(999_999),
    deadline: z.coerce.date().optional(),
  }),
});

export const quoteIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const createProposalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    price: z.number().positive().max(999_999_999),
    message: z.string().trim().max(1000).optional(),
  }),
});

export const proposalIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), proposalId: z.string().uuid() }),
});

export const listQuotesForAdminQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateQuoteRequestInput = z.infer<typeof createQuoteRequestSchema>['body'];
export type CreateProposalInput = z.infer<typeof createProposalSchema>['body'];
export type ListQuotesForAdminQuery = z.infer<typeof listQuotesForAdminQuerySchema>['query'];
