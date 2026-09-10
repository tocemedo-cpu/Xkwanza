import { z } from 'zod';
import { SupportTicketStatus } from '@prisma/client';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string().trim().min(3, 'Assunto demasiado curto').max(160),
    description: z.string().trim().min(10, 'Descreve o problema com mais detalhe').max(4000),
  }),
});

export const ticketIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const addMessageSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    body: z.string().trim().min(1, 'Mensagem vazia').max(4000),
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.nativeEnum(SupportTicketStatus),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(SupportTicketStatus).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>['body'];
export type AddMessageInput = z.infer<typeof addMessageSchema>['body'];
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>['body'];
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>['query'];
