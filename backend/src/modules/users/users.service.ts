import { randomInt } from 'node:crypto';
import { Request } from 'express';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { toPublicUser } from '../auth/auth.service';
import { recordAudit } from '../audit/audit.service';
import { hashPassword } from '../../security/password';

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');
  return toPublicUser(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string; email?: string; province?: string; municipality?: string; activityType?: string },
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
