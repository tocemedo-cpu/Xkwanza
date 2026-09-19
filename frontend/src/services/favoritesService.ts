import { apiClient } from '../api/client';
import { Product } from '../types/marketplace';

export async function fetchMyFavorites(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/favorites');
  return data;
}

export async function addFavorite(productId: string): Promise<void> {
  await apiClient.put(`/favorites/${productId}`);
}

export async function removeFavorite(productId: string): Promise<void> {
  await apiClient.delete(`/favorites/${productId}`);
}
