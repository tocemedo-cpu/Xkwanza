import { Request } from 'express';
import { ComplaintStatus, NotificationType, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { recordNotification } from '../notifications/notifications.service';
import {
  AddComplaintMessageInput,
  CreateComplaintInput,
  ListComplaintsQuery,
  UpdateComplaintStatusInput,
} from './complaints.schema';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT];

const complaintInclude = {
  complainant: { select: { id: true, name: true, role: true } },
  agent: { select: { id: true, name: true, role: true } },
  messages: { orderBy: { createdAt: 'asc' as const }, include: { author: { select: { id: true, name: true, role: true } } } },
};

function isStaff(role: UserRole) {
  return STAFF_ROLES.includes(role);
}

async function getComplaintOrThrow(id: string) {
  const complaint = await prisma.complaint.findUnique({ where: { id }, include: complaintInclude });
  if (!complaint) throw ApiError.notFound('Reclamação não encontrada');
  return complaint;
}

function assertCanAccessComplaint(complaint: { complainantId: string }, userId: string, role: UserRole) {
  if (complaint.complainantId !== userId && !isStaff(role)) {
    throw ApiError.forbidden('Sem acesso a esta reclamação');
  }
}

export async function createComplaint(complainantId: string, input: CreateComplaintInput, req: Request) {
  const complaint = await prisma.complaint.create({
    data: {
      complainantId,
      subject: input.subject,
      description: input.description,
      targetType: input.targetType,
      targetId: input.targetId,
    },
    include: complaintInclude,
  });

  await recordAudit({
    userId: complainantId,
    action: 'COMPLAINT_CREATED',
    entity: 'Complaint',
    entityId: complaint.id,
    result: 'SUCCESS',
    req,
  });

  return complaint;
}

export async function listMyComplaints(complainantId: string) {
  return prisma.complaint.findMany({
    where: { complainantId },
    include: complaintInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

// Uso administrativo/suporte — vê as reclamações de todos os utilizadores.
export async function listComplaints(query: ListComplaintsQuery) {
  const where = { status: query.status };
  const [items, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: complaintInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.complaint.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getComplaint(id: string, userId: string, role: UserRole) {
  const complaint = await getComplaintOrThrow(id);
  assertCanAccessComplaint(complaint, userId, role);
  return complaint;
}

export async function addComplaintMessage(
  id: string,
  userId: string,
  role: UserRole,
  input: AddComplaintMessageInput,
  req: Request,
) {
  const complaint = await getComplaintOrThrow(id);
  assertCanAccessComplaint(complaint, userId, role);

  if (complaint.status === ComplaintStatus.RESOLVED || complaint.status === ComplaintStatus.REJECTED) {
    throw ApiError.badRequest('Esta reclamação já foi encerrada');
  }

  // A primeira resposta de um membro da equipa atribui-lhe a reclamação, se ainda não tiver dono.
  const staffReplying = isStaff(role) && userId !== complaint.complainantId;

  await prisma.$transaction([
    prisma.complaintMessage.create({ data: { complaintId: id, authorId: userId, body: input.body } }),
    prisma.complaint.update({
      where: { id },
      data: {
        agentId: staffReplying && !complaint.agentId ? userId : undefined,
        status: staffReplying && complaint.status === ComplaintStatus.OPEN ? ComplaintStatus.UNDER_REVIEW : undefined,
      },
    }),
  ]);

  await recordAudit({
    userId,
    action: 'COMPLAINT_REPLIED',
    entity: 'Complaint',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  // Notifica sempre "o outro lado" — quem não escreveu esta mensagem. Se ainda não há agente
  // atribuído, não há a quem notificar do lado da equipa (fica só a auditoria).
  const notifyUserId = staffReplying ? complaint.complainantId : complaint.agentId;
  if (notifyUserId) {
    await recordNotification({
      userId: notifyUserId,
      type: NotificationType.SUPPORT,
      title: 'Nova resposta na tua reclamação',
      body: complaint.subject,
      metadata: { complaintId: id },
    });
  }

  return getComplaintOrThrow(id);
}

export async function updateComplaintStatus(id: string, adminId: string, input: UpdateComplaintStatusInput, req: Request) {
  const complaint = await getComplaintOrThrow(id);

  const updated = await prisma.complaint.update({
    where: { id },
    data: { status: input.status, resolutionNote: input.resolutionNote },
    include: complaintInclude,
  });

  await recordAudit({
    userId: adminId,
    action: 'COMPLAINT_STATUS_UPDATED',
    entity: 'Complaint',
    entityId: id,
    result: 'SUCCESS',
    metadata: { status: input.status },
    req,
  });

  await recordNotification({
    userId: complaint.complainantId,
    type: NotificationType.SUPPORT,
    title: 'A tua reclamação foi actualizada',
    body: complaint.subject,
    metadata: { complaintId: id, status: input.status },
  });

  return updated;
}
