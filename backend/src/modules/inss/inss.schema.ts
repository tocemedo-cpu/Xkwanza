import { z } from 'zod';
import { DocumentType } from '@prisma/client';

export const grantConsentSchema = z.object({
  body: z.object({
    purpose: z.string().trim().min(5).max(500),
    authorizedData: z.array(z.string().trim().min(1).max(120)).min(1).max(20),
    origin: z.string().trim().max(30).default('web'),
  }),
});

export const consentIdParamSchema = z.object({
  params: z.object({ consentId: z.string().uuid() }),
});

export const updateNissSchema = z.object({
  body: z.object({
    niss: z.string().trim().min(4).max(30),
  }),
});

export const createDocumentSchema = z.object({
  body: z.object({
    type: z.nativeEnum(DocumentType),
    fileUrl: z.string().trim().url().max(2048),
  }),
});

export const documentIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

// A taxa de contribuição é sempre indicada por quem simula — nunca fixada pela XKWANZA,
// que não pode apresentar valores como se fossem a tabela oficial do INSS.
export const createSimulationSchema = z.object({
  body: z.object({
    declaredBase: z.number().positive().max(999_999_999),
    contributionRate: z.number().positive().max(100),
    regime: z.string().trim().min(2).max(120),
  }),
});

export type GrantConsentInput = z.infer<typeof grantConsentSchema>['body'];
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>['body'];
export type CreateSimulationInput = z.infer<typeof createSimulationSchema>['body'];
