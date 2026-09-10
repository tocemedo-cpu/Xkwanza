import { UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { UpsertMerchantInput } from './merchants.schema';

function assertIsMerchantRole(role: UserRole) {
  if (role !== UserRole.MERCHANT) {
    throw ApiError.forbidden('Apenas comerciantes podem gerir um perfil de comerciante');
  }
}

export async function getMyMerchantProfile(userId: string) {
  const profile = await prisma.merchantProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Ainda não criou o seu perfil de comerciante');
  return profile;
}

export async function upsertMerchantProfile(userId: string, role: UserRole, input: UpsertMerchantInput) {
  assertIsMerchantRole(role);

  return prisma.merchantProfile.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input },
  });
}
