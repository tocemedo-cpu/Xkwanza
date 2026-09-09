import { apiClient } from '../api/client';
import { Category } from '../types/marketplace';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}
