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

// Uso administrativo — vê todos os transportadores registados, com os dados de contacto e
// estado da conta (bloqueio/verificação geridos em /api/users/:id/status).
export async function listTransportersForAdmin(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.transporter.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            province: true,
            municipality: true,
            isActive: true,
            isVerifiedBadge: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transporter.count(),
  ]);
  return { items, total, page, pageSize };
}
