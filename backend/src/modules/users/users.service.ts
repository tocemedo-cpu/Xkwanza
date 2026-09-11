import { randomInt } from 'node:crypto';
import { Request } from 'express';
import { NotificationType, ProfileVerificationStatus } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { toPublicUser } from '../auth/auth.service';
import { recordAudit } from '../audit/audit.service';
import { recordNotification } from '../notifications/notifications.service';
import { hashPassword } from '../../security/password';
import { ReviewVerificationInput, UpdateUserStatusInput } from './users.schema';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  data: {
    name?: string;
    email?: string;
    province?: string;
    municipality?: string;
    locality?: string;
    avatarUrl?: string;
    activityType?: string;
    nif?: string;
    notifyByEmail?: boolean;
    notifyByPush?: boolean;
  },
  req: Request,
) {
  const user = await prisma.user.update({ where: { id: userId }, data: data as never });

  await recordAudit({
    userId,
    action: 'USER_PROFILE_UPDATED',
    entity: 'User',
    entityId: userId,
    result: 'SUCCESS',
    metadata: { fields: Object.keys(data) },
    req,
  });

  return toPublicUser(user);
}

// Uso administrativo — lista utilizadores com paginação simples, sem expor dados sensíveis desnecessários.
export async function listUsers(params: { page: number; pageSize: number; role?: string; search?: string }) {
  const where = {
    ...(params.role ? { role: params.role as never } : {}),
    ...(params.search
      ? {
          OR: [
            { phone: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
            { name: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items: items.map(toPublicUser),
    total,
    page: params.page,
    pageSize: params.pageSize,
  };
}

// Sem canal de SMS/email integrado, evita caracteres ambíguos (l/1, O/0) já que a
// palavra-passe temporária costuma ser lida/transmitida verbalmente pelo suporte.
const TEMP_PASSWORD_LOWER = 'abcdefghijkmnpqrstuvwxyz';
const TEMP_PASSWORD_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const TEMP_PASSWORD_DIGITS = '23456789';

function generateTempPassword(): string {
  const pick = (charset: string) => charset[randomInt(charset.length)];
  const all = TEMP_PASSWORD_LOWER + TEMP_PASSWORD_UPPER + TEMP_PASSWORD_DIGITS;
  const chars = [pick(TEMP_PASSWORD_LOWER), pick(TEMP_PASSWORD_UPPER), pick(TEMP_PASSWORD_DIGITS)];
  for (let i = 0; i < 7; i += 1) chars.push(pick(all));

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

// Recuperação de conta assistida por suporte/administração: enquanto a plataforma não tiver
// SMS/email integrados para um fluxo self-service, esta é a única forma de desbloquear um
// utilizador que perdeu a palavra-passe. Gera uma password temporária, força logout em todas
// as sessões activas, e devolve a password em texto simples uma única vez (nunca persistida
// nem registada em log) para o suporte a transmitir ao utilizador por um canal já confiado
// (ex: chamada telefónica confirmando identidade).
export async function adminResetPassword(targetUserId: string, adminId: string, req: Request) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id: targetUserId }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({
      where: { userId: targetUserId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await recordAudit({
    userId: adminId,
    action: 'USER_PASSWORD_RESET_BY_ADMIN',
    entity: 'User',
    entityId: targetUserId,
    result: 'SUCCESS',
    req,
  });

  return { tempPassword };
}

// Bloquear/desbloquear conta (isActive) e validar perfil (isVerifiedBadge) — administração.
// Um administrador nunca se pode desactivar a si próprio (evita ficar sem acesso por engano).
export async function updateUserStatus(
  targetUserId: string,
  adminId: string,
  input: UpdateUserStatusInput,
  req: Request,
) {
  if (input.isActive === false && targetUserId === adminId) {
    throw ApiError.badRequest('Não pode desactivar a sua própria conta');
  }

  const existing = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!existing) throw ApiError.notFound('Utilizador não encontrado');

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      isActive: input.isActive,
      isVerifiedBadge: input.isVerifiedBadge,
    },
  });

  if (input.isActive !== undefined) {
    await recordAudit({
      userId: adminId,
      action: input.isActive ? 'USER_ACTIVATED' : 'USER_SUSPENDED',
      entity: 'User',
      entityId: targetUserId,
      result: 'SUCCESS',
      req,
    });
  }
  if (input.isVerifiedBadge !== undefined) {
    await recordAudit({
      userId: adminId,
      action: input.isVerifiedBadge ? 'USER_VERIFIED' : 'USER_UNVERIFIED',
      entity: 'User',
      entityId: targetUserId,
      result: 'SUCCESS',
      req,
    });
  }

  return toPublicUser(updated);
}

// Pedido de validação formal de perfil (selo XKWANZA Verificado) — o próprio utilizador inicia,
// a administração decide (ver reviewVerification). Distinto do dossiê de formalização fiscal/
// INSS: este é só sobre a confiança/selo dentro da plataforma.
export async function requestVerification(userId: string, req: Request) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');
  if (user.verificationStatus === ProfileVerificationStatus.PENDING) {
    throw ApiError.badRequest('Já tem um pedido de verificação em análise');
  }
  if (user.isVerifiedBadge) {
    throw ApiError.badRequest('O seu perfil já está verificado');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      verificationStatus: ProfileVerificationStatus.PENDING,
      verificationRequestedAt: new Date(),
      verificationReviewedAt: null,
      verificationNote: null,
    },
  });

  await recordAudit({
    userId,
    action: 'PROFILE_VERIFICATION_REQUESTED',
    entity: 'User',
    entityId: userId,
    result: 'SUCCESS',
    req,
  });

  return toPublicUser(updated);
}

// Uso administrativo — fila de pedidos pendentes de validação formal de perfil.
export async function listVerificationRequests(params: { page: number; pageSize: number }) {
  const where = { verificationStatus: ProfileVerificationStatus.PENDING };
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { verificationRequestedAt: 'asc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return { items: items.map(toPublicUser), total, page: params.page, pageSize: params.pageSize };
}

export async function reviewVerification(
  targetUserId: string,
  adminId: string,
  input: ReviewVerificationInput,
  req: Request,
) {
  const user = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');

  const updated = await prisma.user.update({
    where: { id: targetUserId },
    data: {
      verificationStatus: input.approve ? ProfileVerificationStatus.APPROVED : ProfileVerificationStatus.REJECTED,
      verificationReviewedAt: new Date(),
      verificationNote: input.note ?? null,
      isVerifiedBadge: input.approve ? true : user.isVerifiedBadge,
    },
  });

  await recordAudit({
    userId: adminId,
    action: input.approve ? 'PROFILE_VERIFICATION_APPROVED' : 'PROFILE_VERIFICATION_REJECTED',
    entity: 'User',
    entityId: targetUserId,
    result: 'SUCCESS',
    metadata: { note: input.note },
    req,
  });

  await recordNotification({
    userId: targetUserId,
    type: NotificationType.STATUS_CHANGE,
    title: input.approve ? 'Perfil verificado' : 'Pedido de verificação rejeitado',
    body: input.approve
      ? 'O seu perfil foi validado — já tem o selo XKWANZA Verificado.'
      : `O seu pedido de verificação foi rejeitado. Motivo: ${input.note}`,
  });

  return toPublicUser(updated);
}
