import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { recordNotification } from '../notifications/notifications.service';
import { NotificationType } from '@prisma/client';
import { StartConversationInput } from './messages.schema';

const participantSelect = { id: true, name: true, avatarUrl: true, role: true } as const;

const conversationListInclude = {
  participantOne: { select: participantSelect },
  participantTwo: { select: participantSelect },
  messages: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} satisfies import('@prisma/client').Prisma.ConversationInclude;

const conversationDetailInclude = {
  participantOne: { select: participantSelect },
  participantTwo: { select: participantSelect },
  messages: { orderBy: { createdAt: 'asc' as const }, include: { author: { select: participantSelect } } },
} satisfies import('@prisma/client').Prisma.ConversationInclude;

function assertParticipant(conversation: { participantOneId: string; participantTwoId: string }, userId: string) {
  if (conversation.participantOneId !== userId && conversation.participantTwoId !== userId) {
    throw ApiError.forbidden('Sem acesso a esta conversa');
  }
}

// Uma conversa é identificada pelo par de participantes (ordem canónica, menor id primeiro)
// mais o contexto opcional — reencontra a mesma conversa em vez de criar duplicados quando
// qualquer um dos dois volta a iniciar contacto sobre o mesmo pedido/produto.
export async function startOrGetConversation(currentUserId: string, input: StartConversationInput) {
  if (input.otherUserId === currentUserId) {
    throw ApiError.badRequest('Não pode iniciar uma conversa consigo próprio');
  }
  const otherUser = await prisma.user.findUnique({ where: { id: input.otherUserId } });
  if (!otherUser) throw ApiError.notFound('Utilizador não encontrado');

  const [participantOneId, participantTwoId] = [currentUserId, input.otherUserId].sort();

  const existing = await prisma.conversation.findFirst({
    where: {
      participantOneId,
      participantTwoId,
      contextOrderId: input.contextOrderId ?? null,
      contextProductId: input.contextProductId ?? null,
    },
    include: conversationListInclude,
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      participantOneId,
      participantTwoId,
      contextOrderId: input.contextOrderId,
      contextProductId: input.contextProductId,
    },
    include: conversationListInclude,
  });
}

export async function listMyConversations(userId: string) {
  return prisma.conversation.findMany({
    where: { OR: [{ participantOneId: userId }, { participantTwoId: userId }] },
    include: conversationListInclude,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getConversationForUser(id: string, userId: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id }, include: conversationDetailInclude });
  if (!conversation) throw ApiError.notFound('Conversa não encontrada');
  assertParticipant(conversation, userId);
  return conversation;
}

export async function sendMessage(conversationId: string, authorId: string, body: string) {
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw ApiError.notFound('Conversa não encontrada');
  assertParticipant(conversation, authorId);

  const [message] = await prisma.$transaction([
    prisma.conversationMessage.create({
      data: { conversationId, authorId, body },
      include: { author: { select: participantSelect } },
    }),
    prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } }),
  ]);

  const recipientId = conversation.participantOneId === authorId ? conversation.participantTwoId : conversation.participantOneId;
  await recordNotification({
    userId: recipientId,
    type: NotificationType.STATUS_CHANGE,
    title: 'Nova mensagem',
    body: body.length > 120 ? `${body.slice(0, 117)}...` : body,
    metadata: { conversationId },
  });

  return message;
}
