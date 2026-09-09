import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { CreateBankAccountInput } from './bankAccounts.schema';

export async function listBankAccounts(userId: string) {
  return prisma.bankAccount.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
}

export async function createBankAccount(userId: string, input: CreateBankAccountInput) {
  if (input.isDefault) {
    await prisma.bankAccount.updateMany({ where: { userId, isDefault: true }, data: { isDefault: false } });
  }
  return prisma.bankAccount.create({ data: { ...input, userId } });
}

export async function deleteBankAccount(userId: string, id: string) {
  const account = await prisma.bankAccount.findUnique({ where: { id } });
  if (!account || account.userId !== userId) throw ApiError.notFound('Conta bancária não encontrada');
  await prisma.bankAccount.delete({ where: { id } });
}
