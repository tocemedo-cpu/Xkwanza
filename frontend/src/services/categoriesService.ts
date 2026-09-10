import { apiClient } from '../api/client';
import { Category } from '../types/marketplace';

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/categories');
  return data;
}

export interface CategoryPayload {
  name: string;
  slug: string;
  parentId?: string | null;
}

// Uso administrativo — gestão do catálogo de categorias.
export async function createCategory(payload: CategoryPayload): Promise<Category> {
  const { data } = await apiClient.post<Category>('/categories', payload);
  return data;
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>): Promise<Category> {
  const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/categories/${id}`);
}

// Ponto de partida para uma base de dados sem nenhuma categoria — idempotente, ignora as que
// já existem (por nome ou slug).
export async function seedDefaultCategories(): Promise<{ created: number; total: number }> {
  const { data } = await apiClient.post<{ created: number; total: number }>('/categories/seed-defaults');
  return data;
}
