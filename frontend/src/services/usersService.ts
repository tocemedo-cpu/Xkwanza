import { apiClient } from '../api/client';
import { User, UserRole } from '../types/user';

export interface UsersPage {
  items: User[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchUsers(params: {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  search?: string;
}): Promise<UsersPage> {
  const { data } = await apiClient.get<UsersPage>('/users', { params });
  return data;
}

export async function adminResetPassword(userId: string): Promise<{ tempPassword: string }> {
  const { data } = await apiClient.post<{ tempPassword: string }>(`/users/${userId}/reset-password`);
  return data;
}
