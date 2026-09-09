import { Request } from 'express';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { toPublicUser } from '../auth/auth.service';
import { recordAudit } from '../audit/audit.service';

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
export async function listUsers(params: { page: number; pageSize: number; role?: string }) {
  const where = params.role ? { role: params.role as never } : {};
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
