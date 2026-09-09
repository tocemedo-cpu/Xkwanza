import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';

interface AuditEntry {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  result: 'SUCCESS' | 'FAILURE';
  metadata?: Record<string, unknown>;
  req?: Request;
}

// Eventos críticos (identidade, NIF, NISS, INSS, pagamentos, pedidos, documentos, aprovações
// administrativas) devem sempre ser registados aqui. A tabela é apenas de escrita — nunca
// actualizada ou apagada pela aplicação.
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      entity: entry.entity,
      entityId: entry.entityId,
      result: entry.result,
      metadata: entry.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: entry.req?.ip,
      origin: entry.req?.headers['user-agent']?.toString(),
    },
  });
}
