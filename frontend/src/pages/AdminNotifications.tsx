import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { fetchNotificationsForAdmin } from '../services/notificationsService';
import { NOTIFICATION_TYPE_LABELS, Notification } from '../types/notifications';
import { PaginatedResult } from '../types/marketplace';

export function AdminNotifications() {
  const [result, setResult] = useState<PaginatedResult<Notification> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotificationsForAdmin(1, 50)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Notificações</h1>
        <p className="text-neutral-500">Consulta só de leitura ao que foi enviado a todos os utilizadores.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhuma notificação enviada ainda.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((notification) => (
            <div key={notification.id} className="flex items-start gap-3 p-4 text-sm">
              <Bell size={16} className="mt-0.5 text-neutral-300" />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-neutral-900">
                    {notification.title} <span className="text-neutral-400">→ {notification.user?.name ?? '—'}</span>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
