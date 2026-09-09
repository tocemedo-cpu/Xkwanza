import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { CreateAddressInput, UpdateAddressInput } from './addresses.schema';

export async function listAddresses(userId: string) {
  return prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
}

export async function createAddress(userId: string, input: CreateAddressInput) {
  if (input.isDefault) {
    await prisma.address.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }

  return prisma.address.create({ data: { ...input, userId } });
}

export async function updateAddress(userId: string, id: string, input: UpdateAddressInput) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw ApiError.notFound('Morada não encontrada');

  if (input.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true, NOT: { id } },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({ where: { id }, data: input });
}

export async function deleteAddress(userId: string, id: string) {
  const address = await prisma.address.findUnique({ where: { id } });
  if (!address || address.userId !== userId) throw ApiError.notFound('Morada não encontrada');

  const usedInOrder = await prisma.order.findFirst({ where: { shippingAddressId: id } });
  if (usedInOrder) throw ApiError.conflict('Esta morada está associada a pedidos e não pode ser removida');

  await prisma.address.delete({ where: { id } });
}
