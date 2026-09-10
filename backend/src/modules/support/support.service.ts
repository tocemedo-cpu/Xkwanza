import { Request } from 'express';
import { NotificationType, SupportTicketStatus, UserRole } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordAudit } from '../audit/audit.service';
import { recordNotification } from '../notifications/notifications.service';
import { AddMessageInput, CreateTicketInput, ListTicketsQuery, UpdateTicketStatusInput } from './support.schema';

const STAFF_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT];

const ticketInclude = {
  requester: { select: { id: true, name: true, phone: true, email: true } },
  agent: { select: { id: true, name: true } },
  messages: { orderBy: { createdAt: 'asc' as const }, include: { author: { select: { id: true, name: true, role: true } } } },
};

function isStaff(role: UserRole) {
  return STAFF_ROLES.includes(role);
}

async function getTicketOrThrow(id: string) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: ticketInclude });
  if (!ticket) throw ApiError.notFound('Ticket não encontrado');
  return ticket;
}

function assertCanAccessTicket(ticket: { requesterId: string }, userId: string, role: UserRole) {
  if (ticket.requesterId !== userId && !isStaff(role)) {
    throw ApiError.forbidden('Sem acesso a este ticket');
  }
}

export async function createTicket(requesterId: string, input: CreateTicketInput, req: Request) {
  const ticket = await prisma.supportTicket.create({
    data: { requesterId, subject: input.subject, description: input.description },
    include: ticketInclude,
  });

  await recordAudit({
    userId: requesterId,
    action: 'SUPPORT_TICKET_CREATED',
    entity: 'SupportTicket',
    entityId: ticket.id,
    result: 'SUCCESS',
    req,
  });

  return ticket;
}

export async function listMyTickets(requesterId: string) {
  return prisma.supportTicket.findMany({
    where: { requesterId },
    include: ticketInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

// Uso administrativo — vê os tickets de todos os utilizadores.
export async function listTickets(query: ListTicketsQuery) {
  const where = { status: query.status };
  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      include: ticketInclude,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.supportTicket.count({ where }),
  ]);
  return { items, total, page: query.page, pageSize: query.pageSize };
}

export async function getTicket(id: string, userId: string, role: UserRole) {
  const ticket = await getTicketOrThrow(id);
  assertCanAccessTicket(ticket, userId, role);
  return ticket;
}

export async function addMessage(id: string, userId: string, role: UserRole, input: AddMessageInput, req: Request) {
  const ticket = await getTicketOrThrow(id);
  assertCanAccessTicket(ticket, userId, role);

  if (ticket.status === SupportTicketStatus.CLOSED) {
    throw ApiError.badRequest('Este ticket já está fechado');
  }

  // A primeira resposta de um agente atribui-lhe o ticket, se ainda não tiver dono.
  const staffReplying = isStaff(role) && userId !== ticket.requesterId;

  await prisma.$transaction([
    prisma.supportTicketMessage.create({ data: { ticketId: id, authorId: userId, body: input.body } }),
    prisma.supportTicket.update({
      where: { id },
      data: {
        agentId: staffReplying && !ticket.agentId ? userId : undefined,
        status: staffReplying
          ? SupportTicketStatus.WAITING_ON_USER
          : ticket.status === SupportTicketStatus.WAITING_ON_USER
            ? SupportTicketStatus.IN_PROGRESS
            : undefined,
      },
    }),
  ]);

  await recordAudit({
    userId,
    action: 'SUPPORT_TICKET_REPLIED',
    entity: 'SupportTicket',
    entityId: id,
    result: 'SUCCESS',
    req,
  });

  // Notifica sempre "o outro lado" — quem não escreveu esta mensagem. Se ainda não há agente
  // atribuído, não há a quem notificar do lado do suporte (fica só a auditoria).
  const notifyUserId = staffReplying ? ticket.requesterId : ticket.agentId;
  if (notifyUserId) {
    await recordNotification({
      userId: notifyUserId,
      type: NotificationType.SUPPORT,
      title: 'Nova resposta no teu ticket de suporte',
      body: ticket.subject,
      metadata: { ticketId: id },
    });
  }

  return getTicketOrThrow(id);
}

export async function updateTicketStatus(id: string, userId: string, input: UpdateTicketStatusInput, req: Request) {
  await getTicketOrThrow(id);

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status: input.status },
    include: ticketInclude,
  });

  await recordAudit({
    userId,
    action: 'SUPPORT_TICKET_STATUS_UPDATED',
    entity: 'SupportTicket',
    entityId: id,
    result: 'SUCCESS',
    metadata: { status: input.status },
    req,
  });

  return updated;
}
