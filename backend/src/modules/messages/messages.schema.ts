import { z } from 'zod';

export const startConversationSchema = z.object({
  body: z.object({
    otherUserId: z.string().uuid(),
    contextOrderId: z.string().uuid().optional(),
    contextProductId: z.string().uuid().optional(),
  }),
});

export const conversationIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid('Identificador inválido') }),
});

export const sendMessageSchema = z.object({
  params: z.object({ id: z.string().uuid('Identificador inválido') }),
  body: z.object({
    body: z.string().trim().min(1, 'A mensagem não pode estar vazia').max(4000),
  }),
});

export type StartConversationInput = z.infer<typeof startConversationSchema>['body'];
export type SendMessageInput = z.infer<typeof sendMessageSchema>['body'];
