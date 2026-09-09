import { Request } from 'express';
import { DocumentStatus, FormalizationStatus } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { CreateDocumentInput, SubmitDiagnosisInput, UpdateDossierInput } from './formalization.schema';

// Mapeia cada etapa (1-6) ao estado correspondente do dossiê — reflecte o progresso
// auto-reportado pelo utilizador, nunca uma validação oficial de NIF/NISS/AGT/INSS.
const STAGE_STATUS: Record<number, FormalizationStatus> = {
  1: FormalizationStatus.ACTIVITY_IDENTIFIED,
  2: FormalizationStatus.IDENTITY_VALIDATED,
  3: FormalizationStatus.TAX_NIF_IN_PROGRESS,
  4: FormalizationStatus.SOCIAL_SECURITY_IN_PROGRESS,
  5: FormalizationStatus.DOCUMENTATION_IN_PROGRESS,
  6: FormalizationStatus.COMPLETED,
};

const STAGE_NAMES: Record<number, string> = {
  1: 'Identificação da actividade',
  2: 'Validação da identidade',
  3: 'Registo fiscal (NIF)',
  4: 'Segurança social (INSS)',
  5: 'Documentação',
  6: 'Formalização concluída',
};

const dossierInclude = {
  diagnosis: true,
  stages: { orderBy: { stageNumber: 'asc' } },
  documents: { orderBy: { uploadedAt: 'desc' } },
} as const;

// Orientação genérica gerada localmente a partir das respostas — nunca dados oficiais do
// INSS/AGT nem uma decisão institucional, apenas uma sugestão do próximo passo prático.
function suggestNextStep(input: SubmitDiagnosisInput): string {
  if (!input.hasNif) {
    return 'Comece por obter o Número de Identificação Fiscal (NIF) — é a base para os próximos passos.';
  }
  if (!input.hasInss) {
    return 'Já tem NIF. Considere iniciar a inscrição na Segurança Social (INSS) para começar a construir histórico contributivo.';
  }
  return 'Já tem NIF e está ligado ao INSS. Continue a reunir e validar os seus documentos para concluir a formalização.';
}

export async function submitDiagnosis(userId: string, input: SubmitDiagnosisInput, req: Request) {
  const suggestedNextStep = suggestNextStep(input);

  const dossier = await prisma.$transaction(async (tx) => {
    const existing = await tx.formalizationDossier.findUnique({ where: { userId } });

    const record =
      existing ??
      (await tx.formalizationDossier.create({
        data: { userId, status: FormalizationStatus.ACTIVITY_IDENTIFIED, currentStage: 1, progress: 17 },
      }));

    if (!existing) {
      await tx.formalizationStage.createMany({
        data: Object.entries(STAGE_NAMES).map(([stageNumber, name]) => ({
          dossierId: record.id,
          stageNumber: Number(stageNumber),
          name,
        })),
      });
      await tx.formalizationStage.update({
        where: { dossierId_stageNumber: { dossierId: record.id, stageNumber: 1 } },
        data: { completed: true, completedAt: new Date() },
      });
    } else if (existing.status === FormalizationStatus.NOT_STARTED) {
      await tx.formalizationDossier.update({
        where: { id: record.id },
        data: { status: FormalizationStatus.ACTIVITY_IDENTIFIED, currentStage: 1, progress: 17 },
      });
    }

    await tx.formalizationDiagnosis.upsert({
      where: { dossierId: record.id },
      update: { ...input, suggestedNextStep },
      create: { dossierId: record.id, ...input, suggestedNextStep },
    });

    return tx.formalizationDossier.findUniqueOrThrow({ where: { id: record.id }, include: dossierInclude });
  });

  await recordAudit({
    userId,
    action: 'FORMALIZATION_DIAGNOSIS_SUBMITTED',
    entity: 'FormalizationDossier',
    entityId: dossier.id,
    result: 'SUCCESS',
    req,
  });

  return dossier;
}

export async function getMyDossier(userId: string) {
  const dossier = await prisma.formalizationDossier.findUnique({ where: { userId }, include: dossierInclude });
  if (!dossier) throw ApiError.notFound('Ainda não iniciou o diagnóstico de formalização');
  return dossier;
}

export async function updateDossier(userId: string, input: UpdateDossierInput, req: Request) {
  const dossier = await prisma.formalizationDossier.findUnique({ where: { userId } });
  if (!dossier) throw ApiError.notFound('Ainda não iniciou o diagnóstico de formalização');

  const updated = await prisma.formalizationDossier.update({
    where: { id: dossier.id },
    data: input,
    include: dossierInclude,
  });

  await recordAudit({
    userId,
    action: 'FORMALIZATION_DOSSIER_UPDATED',
    entity: 'FormalizationDossier',
    entityId: dossier.id,
    result: 'SUCCESS',
    metadata: { fields: Object.keys(input) },
    req,
  });

  return updated;
}

// Etapas 1-5 são auto-reportadas pelo próprio utilizador (é um plano de acção, não uma
// validação). A etapa 6 (formalização concluída) só pode ser confirmada pelo suporte,
// depois de verificar realmente os documentos — nunca automaticamente.
export async function completeStage(userId: string, stageNumber: number, req: Request) {
  if (stageNumber === 6) {
    throw ApiError.forbidden('A conclusão final da formalização é confirmada pelo suporte, após verificação dos documentos');
  }

  const dossier = await prisma.formalizationDossier.findUnique({ where: { userId } });
  if (!dossier) throw ApiError.notFound('Ainda não iniciou o diagnóstico de formalização');
  if (stageNumber !== dossier.currentStage) {
    throw ApiError.badRequest('Só pode concluir a etapa actual');
  }

  const nextStage = stageNumber + 1;
  // Ao concluir a etapa 5 entra-se na etapa 6, mas o estado do dossiê mantém-se
  // DOCUMENTATION_IN_PROGRESS — só finalizeDossier() (suporte) pode marcar COMPLETED.
  const nextStatus = nextStage === 6 ? FormalizationStatus.DOCUMENTATION_IN_PROGRESS : STAGE_STATUS[nextStage];

  const updated = await prisma.$transaction(async (tx) => {
    await tx.formalizationStage.update({
      where: { dossierId_stageNumber: { dossierId: dossier.id, stageNumber } },
      data: { completed: true, completedAt: new Date() },
    });

    return tx.formalizationDossier.update({
      where: { id: dossier.id },
      data: {
        currentStage: nextStage,
        status: nextStatus,
        progress: Math.round((stageNumber / 6) * 100),
      },
      include: dossierInclude,
    });
  });

  await recordAudit({
    userId,
    action: 'FORMALIZATION_STAGE_COMPLETED',
    entity: 'FormalizationDossier',
    entityId: dossier.id,
    result: 'SUCCESS',
    metadata: { stageNumber },
    req,
  });

  return updated;
}

export async function finalizeDossier(adminId: string, targetUserId: string, req: Request) {
  const dossier = await prisma.formalizationDossier.findUnique({ where: { userId: targetUserId } });
  if (!dossier) throw ApiError.notFound('Dossiê não encontrado');
  if (dossier.currentStage < 5) {
    throw ApiError.badRequest('As etapas anteriores ainda não foram concluídas');
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.formalizationStage.update({
      where: { dossierId_stageNumber: { dossierId: dossier.id, stageNumber: 6 } },
      data: { completed: true, completedAt: new Date() },
    });

    return tx.formalizationDossier.update({
      where: { id: dossier.id },
      data: { currentStage: 6, status: FormalizationStatus.COMPLETED, progress: 100 },
      include: dossierInclude,
    });
  });

  await recordAudit({
    userId: adminId,
    action: 'FORMALIZATION_DOSSIER_FINALIZED',
    entity: 'FormalizationDossier',
    entityId: dossier.id,
    result: 'SUCCESS',
    metadata: { targetUserId },
    req,
  });

  return updated;
}

export async function listDossiersReadyToFinalize() {
  return prisma.formalizationDossier.findMany({
    where: { currentStage: 5, status: { not: FormalizationStatus.COMPLETED } },
    include: { user: { select: { id: true, name: true, phone: true } } },
    orderBy: { updatedAt: 'asc' },
  });
}

export async function createDocument(userId: string, input: CreateDocumentInput) {
  const dossier = await prisma.formalizationDossier.findUnique({ where: { userId } });
  return prisma.document.create({
    data: { ownerId: userId, dossierId: dossier?.id, type: input.type, fileUrl: input.fileUrl },
  });
}

export async function listMyDocuments(userId: string) {
  return prisma.document.findMany({ where: { ownerId: userId }, orderBy: { uploadedAt: 'desc' } });
}

export async function listPendingDocuments() {
  return prisma.document.findMany({
    where: { status: { in: [DocumentStatus.PENDING, DocumentStatus.UNDER_REVIEW] } },
    include: { owner: { select: { id: true, name: true, phone: true } } },
    orderBy: { uploadedAt: 'asc' },
  });
}

export async function verifyDocument(adminId: string, id: string, req: Request) {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw ApiError.notFound('Documento não encontrado');

  const updated = await prisma.document.update({
    where: { id },
    data: { status: DocumentStatus.VERIFIED, verifiedAt: new Date(), verifiedBy: adminId },
  });

  await recordAudit({
    userId: adminId,
    action: 'DOCUMENT_VERIFIED',
    entity: 'Document',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function rejectDocument(adminId: string, id: string, req: Request) {
  const document = await prisma.document.findUnique({ where: { id } });
  if (!document) throw ApiError.notFound('Documento não encontrado');

  const updated = await prisma.document.update({ where: { id }, data: { status: DocumentStatus.REJECTED } });

  await recordAudit({
    userId: adminId,
    action: 'DOCUMENT_REJECTED',
    entity: 'Document',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}
