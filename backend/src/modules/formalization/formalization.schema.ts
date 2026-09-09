import { z } from 'zod';
import { ActivityType, DocumentType } from '@prisma/client';
import { ANGOLA_PROVINCES } from '../../utils/angola';

export const submitDiagnosisSchema = z.object({
  body: z.object({
    activityDescription: z.string().trim().min(5).max(1000),
    workLocation: z.string().trim().min(2).max(255),
    hasNif: z.boolean(),
    hasInss: z.boolean(),
    worksAlone: z.boolean(),
    hasHelpers: z.boolean(),
    sellsInMarket: z.boolean(),
    worksOnStreet: z.boolean(),
    worksFromHome: z.boolean(),
    worksOnFarm: z.boolean(),
    doesDeliveries: z.boolean(),
    usesOwnVehicle: z.boolean(),
  }),
});

export const updateDossierSchema = z.object({
  body: z.object({
    activityType: z.nativeEnum(ActivityType).optional(),
    businessName: z.string().trim().min(2).max(160).optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
    marketLocation: z.string().trim().max(255).optional(),
    nif: z.string().trim().max(30).optional(),
    niss: z.string().trim().max(30).optional(),
  }),
});

export const completeStageParamSchema = z.object({
  params: z.object({ stageNumber: z.coerce.number().int().min(1).max(6) }),
});

export const finalizeDossierParamSchema = z.object({
  params: z.object({ userId: z.string().uuid() }),
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

export type SubmitDiagnosisInput = z.infer<typeof submitDiagnosisSchema>['body'];
export type UpdateDossierInput = z.infer<typeof updateDossierSchema>['body'];
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>['body'];
