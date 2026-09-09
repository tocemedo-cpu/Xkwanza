import { Request } from 'express';
import { prisma } from '../../database/prisma';
import { recordAudit } from '../audit/audit.service';

export async function getMyWallet(userId: string) {
  return prisma.wallet.upsert({
    where: { userId },
    update: {},
    create: { userId, balance: 0 },
  });
}

// Crédito manual — representa um depósito confirmado fora da plataforma (ex: transferência
// bancária verificada pelo suporte). Não existe movimentação real de dinheiro automatizada
// enquanto não houver integração institucional/bancária autorizada (Fase 8/9).
export async function creditWallet(adminId: string, targetUserId: string, amount: number, note: string | undefined, req: Request) {
  const wallet = await prisma.wallet.upsert({
    where: { userId: targetUserId },
    update: { balance: { increment: amount } },
    create: { userId: targetUserId, balance: amount },
  });

  await recordAudit({
    userId: adminId,
    action: 'WALLET_CREDITED',
    entity: 'Wallet',
    entityId: wallet.id,
    result: 'SUCCESS',
    metadata: { targetUserId, amount, note },
    req,
  });

  return wallet;
}
