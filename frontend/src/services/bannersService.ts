import { apiClient } from '../api/client';
import { Banner, CreateBannerInput, UpdateBannerInput } from '../types/banners';

export async function fetchActiveBanners(): Promise<Banner[]> {
  const { data } = await apiClient.get<Banner[]>('/banners/active');
  return data;
}

export async function fetchAllBanners(): Promise<Banner[]> {
  const { data } = await apiClient.get<Banner[]>('/banners');
  return data;
}

export async function createBanner(input: CreateBannerInput): Promise<Banner> {
  const { data } = await apiClient.post<Banner>('/banners', input);
  return data;
}

export async function updateBanner(id: string, input: UpdateBannerInput): Promise<Banner> {
  const { data } = await apiClient.patch<Banner>(`/banners/${id}`, input);
  return data;
}

export async function deleteBanner(id: string): Promise<void> {
  await apiClient.delete(`/banners/${id}`);
}

export async function uploadBannerImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>('/banners/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
