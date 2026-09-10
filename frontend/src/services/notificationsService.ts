import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { Notification } from '../types/notifications';

export async function fetchMyNotifications(): Promise<Notification[]> {
  const { data } = await apiClient.get<Notification[]>('/notifications/mine');
  return data;
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.patch('/notifications/read-all');
}

// Uso administrativo — consulta só de leitura ao que já foi enviado.
export async function fetchNotificationsForAdmin(page = 1, pageSize = 30): Promise<PaginatedResult<Notification>> {
  const { data } = await apiClient.get<PaginatedResult<Notification>>('/notifications/admin', {
    params: { page, pageSize },
  });
  return data;
}
