import { Request } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ListAuditLogsQuery } from './audit.schema';

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

// Uso administrativo — consulta ao registo de auditoria (só leitura; nunca actualizado/apagado).
export async function listAuditLogs(query: ListAuditLogsQuery) {
  const where: Prisma.AuditLogWhereInput = {
    entity: query.entity,
    action: query.action,
    userId: query.userId,
    result: query.result,
  };

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { id: true, name: true, role: true } } },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { items, total, page: query.page, pageSize: query.pageSize };
}
