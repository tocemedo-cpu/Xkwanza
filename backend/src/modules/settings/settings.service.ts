import { Request } from 'express';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';

const UPDATED_BY_SELECT = { updatedBy: { select: { id: true, name: true } } } as const;

export async function listSettings() {
  return prisma.platformSetting.findMany({ orderBy: { key: 'asc' }, include: UPDATED_BY_SELECT });
}

export async function getSetting(key: string) {
  const setting = await prisma.platformSetting.findUnique({ where: { key }, include: UPDATED_BY_SELECT });
  if (!setting) throw ApiError.notFound('Configuração não encontrada');
  return setting;
}

export async function upsertSetting(key: string, value: string, adminId: string, req?: Request) {
  const setting = await prisma.platformSetting.upsert({
    where: { key },
    create: { key, value, updatedById: adminId },
    update: { value, updatedById: adminId },
    include: UPDATED_BY_SELECT,
  });

  await recordAudit({
    userId: adminId,
    action: 'PLATFORM_SETTING_UPDATED',
    entity: 'PlatformSetting',
    entityId: key,
    result: 'SUCCESS',
    metadata: { value },
    req,
  });

  return setting;
}

export async function deleteSetting(key: string, adminId: string, req?: Request) {
  const existing = await prisma.platformSetting.findUnique({ where: { key } });
  if (!existing) throw ApiError.notFound('Configuração não encontrada');

  await prisma.platformSetting.delete({ where: { key } });

  await recordAudit({
    userId: adminId,
    action: 'PLATFORM_SETTING_DELETED',
    entity: 'PlatformSetting',
    entityId: key,
    result: 'SUCCESS',
    req,
  });
}

// Leitura de configuração para uso interno de outros módulos (ex: taxas, flags de feature) —
// não é um endpoint HTTP, não exige sessão de ADMIN e nunca lança erro: devolve o valor por
// omissão quando a chave ainda não foi definida.
export async function getSettingValue(key: string, fallback: string): Promise<string> {
  const setting = await prisma.platformSetting.findUnique({ where: { key } });
  return setting?.value ?? fallback;
}
