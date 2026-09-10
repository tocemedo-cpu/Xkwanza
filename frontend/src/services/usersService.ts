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

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  province?: string;
  municipality?: string;
  locality?: string;
  avatarUrl?: string;
  activityType?: string;
  nif?: string;
}

export async function fetchMyProfile(): Promise<User> {
  const { data } = await apiClient.get<User>('/users/me');
  return data;
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<User> {
  const { data } = await apiClient.patch<User>('/users/me', payload);
  return data;
}

export async function updateUserStatus(
  userId: string,
  payload: { isActive?: boolean; isVerifiedBadge?: boolean },
): Promise<User> {
  const { data } = await apiClient.patch<User>(`/users/${userId}/status`, payload);
  return data;
}
