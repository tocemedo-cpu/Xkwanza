import { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { fetchMyNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notificationsService';
import { NOTIFICATION_TYPE_LABELS, Notification } from '../types/notifications';

export function Notificacoes() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function reload() {
    setIsLoading(true);
    fetchMyNotifications()
      .then(setNotifications)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleMarkRead(id: string) {
    const updated = await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  }

  async function handleMarkAllRead() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Notificações</h1>
          <p className="text-neutral-500">Actividade recente na sua conta XKWANZA.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50"
          >
            <Check size={14} />
            Marcar todas como lidas
          </button>
        )}
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && notifications.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Sem notificações por agora.
        </p>
      )}

      {!isLoading && notifications.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {notifications.map((notification) => (
            <button
              key={notification.id}
              onClick={() => !notification.read && handleMarkRead(notification.id)}
              className={`flex w-full items-start gap-3 p-4 text-left text-sm hover:bg-neutral-50 ${
                notification.read ? '' : 'bg-xkwanza-50/50'
              }`}
            >
              <Bell size={16} className={notification.read ? 'mt-0.5 text-neutral-300' : 'mt-0.5 text-xkwanza-600'} />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`font-medium ${notification.read ? 'text-neutral-700' : 'text-neutral-900'}`}>
                    {notification.title}
                  </p>
                  <span className="whitespace-nowrap text-xs text-neutral-400">
                    {new Date(notification.createdAt).toLocaleString('pt-AO')}
                  </span>
                </div>
                <p className="text-neutral-500">{notification.body}</p>
                <span className="mt-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {NOTIFICATION_TYPE_LABELS[notification.type]}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
