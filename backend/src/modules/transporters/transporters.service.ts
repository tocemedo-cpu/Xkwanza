import { UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { UpsertTransporterInput } from './transporters.schema';

function assertIsTransporterRole(role: UserRole) {
  if (role !== UserRole.TRANSPORTER) {
    throw ApiError.forbidden('Apenas transportadores podem gerir um perfil de transportador');
  }
}

export async function getMyTransporterProfile(userId: string) {
  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) throw ApiError.notFound('Ainda não criou o seu perfil de transportador');
  return transporter;
}

export async function upsertTransporterProfile(userId: string, role: UserRole, input: UpsertTransporterInput) {
  assertIsTransporterRole(role);

  return prisma.transporter.upsert({
    where: { userId },
    update: input,
    create: { userId, ...input },
  });
}

export async function setAvailability(userId: string, role: UserRole, isAvailable: boolean) {
  assertIsTransporterRole(role);

  const transporter = await prisma.transporter.findUnique({ where: { userId } });
  if (!transporter) throw ApiError.notFound('Ainda não criou o seu perfil de transportador');

  return prisma.transporter.update({ where: { userId }, data: { isAvailable } });
}
