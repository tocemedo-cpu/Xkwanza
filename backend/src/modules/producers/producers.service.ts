import { UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { UpsertProducerInput } from './producers.schema';

function assertIsProducerRole(role: UserRole) {
  if (role !== UserRole.PRODUCER) {
    throw ApiError.forbidden('Apenas produtores podem gerir um perfil de produtor');
  }
}

export async function getMyProducerProfile(userId: string) {
  const profile = await prisma.producerProfile.findUnique({ where: { userId } });
  if (!profile) throw ApiError.notFound('Ainda não criou o seu perfil de produtor');
  return profile;
}

export async function upsertProducerProfile(userId: string, role: UserRole, input: UpsertProducerInput) {
  assertIsProducerRole(role);

  return prisma.producerProfile.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input },
  });
}
