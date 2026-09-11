import { z } from 'zod';
import { ComplaintStatus, ComplaintTargetType } from '@prisma/client';

export const createComplaintSchema = z.object({
  body: z.object({
    subject: z.string().trim().min(3, 'Assunto demasiado curto').max(160),
    description: z.string().trim().min(10, 'Descreve a reclamação com mais detalhe').max(4000),
    targetType: z.nativeEnum(ComplaintTargetType).default(ComplaintTargetType.OTHER),
    targetId: z.string().uuid().optional(),
  }),
});

export const complaintIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const addComplaintMessageSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    body: z.string().trim().min(1, 'Mensagem vazia').max(4000),
  }),
});

export const updateComplaintStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z
    .object({
      status: z.nativeEnum(ComplaintStatus),
      resolutionNote: z.string().trim().max(2000).optional(),
    })
    .refine(
      (data) =>
        (data.status !== ComplaintStatus.RESOLVED && data.status !== ComplaintStatus.REJECTED) ||
        (data.resolutionNote && data.resolutionNote.length > 0),
      {
        message: 'É necessário indicar uma nota de resolução para resolver ou rejeitar a reclamação',
        path: ['resolutionNote'],
      },
    ),
});

export const listComplaintsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(ComplaintStatus).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>['body'];
export type AddComplaintMessageInput = z.infer<typeof addComplaintMessageSchema>['body'];
export type UpdateComplaintStatusInput = z.infer<typeof updateComplaintStatusSchema>['body'];
export type ListComplaintsQuery = z.infer<typeof listComplaintsQuerySchema>['query'];
