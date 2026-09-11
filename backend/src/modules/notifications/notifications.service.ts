import { NotificationChannel, NotificationType, Prisma } from '@prisma/client';
import { prisma } from '../../database/prisma';
import { ApiError } from '../../utils/apiError';
import { isEmailConfigured, sendEmail } from './email.adapter';
import { isPushConfigured, sendPush } from './push.adapter';

// Chamado por outros módulos (pedidos, suporte, negociações...) sempre que acontece algo
// relevante para um utilizador. A linha IN_APP é sempre gravada primeiro (é a fonte de verdade
// consultada em /notifications) — email/push são melhor esforço a seguir: nunca bloqueiam nem
// fazem esta função falhar, e só acontecem quando o utilizador os quer (notifyByEmail/
// notifyByPush) e o respectivo adapter está configurado neste ambiente.
export async function recordNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      channel: NotificationChannel.IN_APP,
      title: params.title,
      body: params.body,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
    },
  });

  if (!isEmailConfigured() && !isPushConfigured()) return;

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { email: true, notifyByEmail: true, notifyByPush: true },
  });
  if (!user) return;

  if (user.notifyByEmail && user.email && isEmailConfigured()) {
    void sendEmail({ to: user.email, subject: params.title, text: params.body });
  }
  if (user.notifyByPush && isPushConfigured()) {
    void sendPush({ userId: params.userId, title: params.title, body: params.body });
  }
}

export async function listMyNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

export async function markNotificationRead(userId: string, id: string) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification || notification.userId !== userId) throw ApiError.notFound('Notificação não encontrada');
  return prisma.notification.update({ where: { id }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}

// Uso administrativo — consulta só de leitura ao que já foi enviado (não compõe/dispara novas).
export async function listNotificationsForAdmin(page: number, pageSize: number) {
  const [items, total] = await Promise.all([
    prisma.notification.findMany({
      include: { user: { select: { id: true, name: true, role: true } } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count(),
  ]);
  return { items, total, page, pageSize };
}
