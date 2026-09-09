import { Request } from 'express';
import { DocumentStatus, INSSStatus } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { inssAdapter } from './inss.adapter';
import { CreateDocumentInput, CreateSimulationInput, GrantConsentInput } from './inss.schema';

const linkageInclude = {
  consents: { orderBy: { grantedAt: 'desc' } },
  syncEvents: { orderBy: { createdAt: 'desc' }, take: 20 },
  documents: { orderBy: { uploadedAt: 'desc' } },
  simulations: { orderBy: { createdAt: 'desc' } },
} as const;

async function getOrCreateLinkage(userId: string) {
  return prisma.iNSSLinkage.upsert({
    where: { userId },
    update: {},
    create: { userId, status: INSSStatus.NOT_STARTED },
  });
}

export async function getMyLinkage(userId: string) {
  const linkage = await getOrCreateLinkage(userId);
  return prisma.iNSSLinkage.findUniqueOrThrow({ where: { id: linkage.id }, include: linkageInclude });
}

async function hasActiveConsent(linkageId: string) {
  const consent = await prisma.iNSSConsent.findFirst({
    where: { linkageId, revokedAt: null, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  });
  return Boolean(consent);
}

export async function grantConsent(userId: string, input: GrantConsentInput, req: Request) {
  const linkage = await getOrCreateLinkage(userId);

  await prisma.iNSSConsent.create({
    data: {
      linkageId: linkage.id,
      purpose: input.purpose,
      authorizedData: input.authorizedData,
      version: '1.0',
      origin: input.origin,
      ipAddress: req.ip,
    },
  });

  const updated = await prisma.iNSSLinkage.update({
    where: { id: linkage.id },
    data: { status: linkage.status === INSSStatus.NOT_STARTED ? INSSStatus.READY : linkage.status },
    include: linkageInclude,
  });

  await prisma.iNSSSyncEvent.create({
    data: {
      linkageId: linkage.id,
      eventType: 'CONSENT_GRANTED',
      adapterMode: inssAdapter.mode,
      success: true,
      message: 'Consentimento registado pelo utilizador',
    },
  });

  await recordAudit({
    userId,
    action: 'INSS_CONSENT_GRANTED',
    entity: 'INSSLinkage',
    entityId: linkage.id,
    result: 'SUCCESS',
    metadata: { purpose: input.purpose, authorizedData: input.authorizedData },
    req,
  });

  return updated;
}

export async function revokeConsent(userId: string, consentId: string, req: Request) {
  const consent = await prisma.iNSSConsent.findUnique({ where: { id: consentId }, include: { linkage: true } });
  if (!consent || consent.linkage.userId !== userId) throw ApiError.notFound('Consentimento não encontrado');
  if (consent.revokedAt) throw ApiError.badRequest('Este consentimento já foi revogado');

  await prisma.iNSSConsent.update({ where: { id: consentId }, data: { revokedAt: new Date() } });

  const stillActive = await hasActiveConsent(consent.linkageId);
  const updated = await prisma.iNSSLinkage.update({
    where: { id: consent.linkageId },
    data: stillActive ? {} : { status: INSSStatus.NOT_STARTED },
    include: linkageInclude,
  });

  await prisma.iNSSSyncEvent.create({
    data: {
      linkageId: consent.linkageId,
      eventType: 'CONSENT_REVOKED',
      adapterMode: inssAdapter.mode,
      success: true,
      message: 'Consentimento revogado pelo utilizador',
    },
  });

  await recordAudit({
    userId,
    action: 'INSS_CONSENT_REVOKED',
    entity: 'INSSLinkage',
    entityId: consent.linkageId,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function updateNiss(userId: string, niss: string, req: Request) {
  const linkage = await getOrCreateLinkage(userId);

  const updated = await prisma.iNSSLinkage.update({
    where: { id: linkage.id },
    data: { niss },
    include: linkageInclude,
  });

  await recordAudit({
    userId,
    action: 'INSS_NISS_RECORDED',
    entity: 'INSSLinkage',
    entityId: linkage.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function submitLinkage(userId: string, req: Request) {
  const linkage = await getOrCreateLinkage(userId);
  if (!(await hasActiveConsent(linkage.id))) {
    throw ApiError.badRequest('É necessário conceder consentimento antes de submeter');
  }
  if (linkage.status !== INSSStatus.READY) {
    throw ApiError.badRequest('A ligação não está pronta para ser submetida');
  }

  const result = await inssAdapter.submit();

  const updated = await prisma.iNSSLinkage.update({
    where: { id: linkage.id },
    data: { status: INSSStatus.SUBMITTED, lastSyncedAt: new Date() },
    include: linkageInclude,
  });

  await prisma.iNSSSyncEvent.create({
    data: {
      linkageId: linkage.id,
      eventType: 'LINKAGE_SUBMITTED',
      adapterMode: inssAdapter.mode,
      success: result.success,
      message: result.message,
    },
  });

  await recordAudit({
    userId,
    action: 'INSS_LINKAGE_SUBMITTED',
    entity: 'INSSLinkage',
    entityId: linkage.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function syncStatus(userId: string, req: Request) {
  const linkage = await getOrCreateLinkage(userId);
  if (linkage.status !== INSSStatus.SUBMITTED && linkage.status !== INSSStatus.INSS_PENDING) {
    throw ApiError.badRequest('Nada para sincronizar neste estado');
  }

  const result = await inssAdapter.checkStatus();

  const updated = await prisma.iNSSLinkage.update({
    where: { id: linkage.id },
    data: { status: INSSStatus.INSS_PENDING, lastSyncedAt: new Date() },
    include: linkageInclude,
  });

  await prisma.iNSSSyncEvent.create({
    data: {
      linkageId: linkage.id,
      eventType: 'STATUS_SYNC',
      adapterMode: inssAdapter.mode,
      success: result.success,
      message: result.message,
    },
  });

  await recordAudit({
    userId,
    action: 'INSS_STATUS_SYNCED',
    entity: 'INSSLinkage',
    entityId: linkage.id,
    result: 'SUCCESS',
    req,
  });

  return updated;
}

export async function createDocument(userId: string, input: CreateDocumentInput) {
  const linkage = await getOrCreateLinkage(userId);
  return prisma.iNSSDocument.create({
    data: { linkageId: linkage.id, type: input.type, fileUrl: input.fileUrl },
  });
}

export async function listMyDocuments(userId: string) {
  const linkage = await getOrCreateLinkage(userId);
  return prisma.iNSSDocument.findMany({ where: { linkageId: linkage.id }, orderBy: { uploadedAt: 'desc' } });
}

export async function listPendingDocuments() {
  return prisma.iNSSDocument.findMany({
    where: { status: { in: [DocumentStatus.PENDING, DocumentStatus.UNDER_REVIEW] } },
    include: { linkage: { include: { user: { select: { id: true, name: true, phone: true } } } } },
    orderBy: { uploadedAt: 'asc' },
  });
}

export async function verifyDocument(adminId: string, id: string, req: Request) {
  const document = await prisma.iNSSDocument.findUnique({ where: { id } });
  if (!document) throw ApiError.notFound('Documento não encontrado');

  const updated = await prisma.iNSSDocument.update({
    where: { id },
    data: { status: DocumentStatus.VERIFIED, verifiedAt: new Date() },
  });

  await recordAudit({ userId: adminId, action: 'INSS_DOCUMENT_VERIFIED', entity: 'INSSDocument', entityId: id, result: 'SUCCESS', req });
  return updated;
}

export async function rejectDocument(adminId: string, id: string, req: Request) {
  const document = await prisma.iNSSDocument.findUnique({ where: { id } });
  if (!document) throw ApiError.notFound('Documento não encontrado');

  const updated = await prisma.iNSSDocument.update({ where: { id }, data: { status: DocumentStatus.REJECTED } });

  await recordAudit({ userId: adminId, action: 'INSS_DOCUMENT_REJECTED', entity: 'INSSDocument', entityId: id, result: 'SUCCESS', req });
  return updated;
}

export async function createSimulation(userId: string, input: CreateSimulationInput, req: Request) {
  const linkage = await getOrCreateLinkage(userId);

  const monthlyContribution = Number((input.declaredBase * (input.contributionRate / 100)).toFixed(2));
  const annualContribution = Number((monthlyContribution * 12).toFixed(2));

  const simulation = await prisma.iNSSSimulation.create({
    data: {
      linkageId: linkage.id,
      declaredBase: input.declaredBase,
      contributionRate: input.contributionRate,
      monthlyContribution,
      annualContribution,
      regime: input.regime,
      isSimulationOnly: true,
    },
  });

  await recordAudit({
    userId,
    action: 'INSS_SIMULATION_CREATED',
    entity: 'INSSSimulation',
    entityId: simulation.id,
    result: 'SUCCESS',
    req,
  });

  return simulation;
}

export async function listMySimulations(userId: string) {
  const linkage = await getOrCreateLinkage(userId);
  return prisma.iNSSSimulation.findMany({ where: { linkageId: linkage.id }, orderBy: { createdAt: 'desc' } });
}
