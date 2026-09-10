import { randomUUID } from 'crypto';
import { Request } from 'express';
import { ActivityType, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { hashPassword, verifyPassword } from '../../security/password';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../security/jwt';
import { sha256 } from '../../security/hash';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { LoginInput, RegisterInput } from './auth.schema';

// Perfis que só podem ser criados internamente (nunca via registo público).
const INTERNAL_ONLY_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT];

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function publicUser(user: {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  nif: string | null;
  activityType: ActivityType | null;
  role: UserRole;
  province: string;
  municipality: string;
  trustLevel: string;
  isVerifiedBadge: boolean;
  createdAt: Date;
}) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    email: user.email,
    nif: user.nif,
    activityType: user.activityType,
    role: user.role,
    province: user.province,
    municipality: user.municipality,
    trustLevel: user.trustLevel,
    isVerifiedBadge: user.isVerifiedBadge,
    createdAt: user.createdAt,
  };
}

async function issueTokenPair(userId: string, role: UserRole, req: Request) {
  const accessToken = signAccessToken({ sub: userId, role });

  const jti = randomUUID();
  const refreshToken = signRefreshToken({ sub: userId, jti });

  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId,
      tokenHash: sha256(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      createdByIp: req.ip,
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput, req: Request) {
  if (INTERNAL_ONLY_ROLES.includes(input.role)) {
    throw ApiError.forbidden('Este perfil não pode ser criado por auto-registo');
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(input.phone ? [{ phone: input.phone }] : []),
        ...(input.email ? [{ email: input.email }] : []),
        ...(input.nif ? [{ nif: input.nif }] : []),
      ],
    },
  });
  if (existing) {
    throw ApiError.conflict('Já existe uma conta com este telefone, email ou NIF');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email,
      nif: input.nif,
      passwordHash,
      role: input.role,
      province: input.province,
      municipality: input.municipality,
      activityType: input.activityType,
    },
  });

  await recordAudit({
    userId: user.id,
    action: 'USER_REGISTERED',
    entity: 'User',
    entityId: user.id,
    result: 'SUCCESS',
    req,
  });

  const tokens = await issueTokenPair(user.id, user.role, req);
  return { user: publicUser(user), ...tokens };
}

export async function login(input: LoginInput, req: Request) {
  // O identificador pode ser telefone ou email — procura-se pelos dois em vez de tentar
  // adivinhar o formato, para não rejeitar por engano um formato ligeiramente diferente.
  const identifier = input.identifier.trim().toLowerCase();
  const user = await prisma.user.findFirst({
    where: { OR: [{ phone: identifier }, { email: identifier }] },
  });

  if (!user || !(await verifyPassword(user.passwordHash, input.password))) {
    await recordAudit({
      action: 'USER_LOGIN',
      entity: 'User',
      result: 'FAILURE',
      metadata: { identifier },
      req,
    });
    throw ApiError.unauthorized('Telefone/email ou palavra-passe incorrectos');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Conta desactivada. Contacte o suporte.');
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  await recordAudit({
    userId: user.id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user.id,
    result: 'SUCCESS',
    req,
  });

  const tokens = await issueTokenPair(user.id, user.role, req);
  return { user: publicUser(user), ...tokens };
}

export async function refresh(refreshToken: string, req: Request) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Token de renovação inválido');
  }

  const stored = await prisma.refreshToken.findUnique({ where: { id: payload.jti } });
  if (!stored || stored.tokenHash !== sha256(refreshToken) || stored.revokedAt || stored.expiresAt < new Date()) {
    throw ApiError.unauthorized('Token de renovação inválido ou expirado');
  }

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Conta inválida');
  }

  // Rotação de refresh token — invalida o anterior para reduzir o risco de reutilização.
  const newTokens = await issueTokenPair(user.id, user.role, req);
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return { user: publicUser(user), ...newTokens };
}

export async function logout(refreshToken: string) {
  try {
    const payload = verifyRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { id: payload.jti, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } catch {
    // token já inválido — logout é sempre bem-sucedido do ponto de vista do cliente
  }
}

export function toPublicUser(user: Parameters<typeof publicUser>[0]) {
  return publicUser(user);
}
