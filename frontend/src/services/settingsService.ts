import { apiClient } from '../api/client';
import { PlatformSetting } from '../types/settings';

export async function fetchSettings(): Promise<PlatformSetting[]> {
  const { data } = await apiClient.get<PlatformSetting[]>('/settings');
  return data;
}

export async function fetchSetting(key: string): Promise<PlatformSetting> {
  const { data } = await apiClient.get<PlatformSetting>(`/settings/${key}`);
  return data;
}

export async function upsertSetting(key: string, value: string): Promise<PlatformSetting> {
  const { data } = await apiClient.put<PlatformSetting>(`/settings/${key}`, { value });
  return data;
}

export async function deleteSetting(key: string): Promise<void> {
  await apiClient.delete(`/settings/${key}`);
}
