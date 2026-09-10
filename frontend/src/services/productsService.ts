import { apiClient } from '../api/client';
import {
  CreateProductPayload,
  PaginatedResult,
  Product,
  ProductFilters,
  ProductPhoto,
  UpdateProductPayload,
} from '../types/marketplace';

export async function fetchProducts(filters: ProductFilters): Promise<PaginatedResult<Product>> {
  const { data } = await apiClient.get<PaginatedResult<Product>>('/products', { params: filters });
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/products/${id}`);
  return data;
}

export async function fetchMyProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/products/mine');
  return data;
}

export async function createProduct(payload: CreateProductPayload): Promise<Product> {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
}

export async function updateProduct(id: string, payload: UpdateProductPayload): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function publishProduct(id: string): Promise<Product> {
  const { data } = await apiClient.post<Product>(`/products/${id}/publish`);
  return data;
}

export async function unpublishProduct(id: string): Promise<Product> {
  const { data } = await apiClient.post<Product>(`/products/${id}/unpublish`);
  return data;
}

export async function addProductPhoto(id: string, url: string): Promise<ProductPhoto> {
  const { data } = await apiClient.post<ProductPhoto>(`/products/${id}/photos`, { url });
  return data;
}

export async function uploadProductPhoto(id: string, file: File): Promise<ProductPhoto> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<ProductPhoto>(`/products/${id}/photos/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function removeProductPhoto(id: string, photoId: string): Promise<void> {
  await apiClient.delete(`/products/${id}/photos/${photoId}`);
}

// Uso administrativo — moderação de anúncios de qualquer dono.
export async function fetchProductsForAdmin(filters: {
  search?: string;
  status?: string;
  listingType?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedResult<Product>> {
  const { data } = await apiClient.get<PaginatedResult<Product>>('/products/admin', { params: filters });
  return data;
}

export async function moderateProduct(id: string, status: 'UNPUBLISHED' | 'REMOVED'): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/products/${id}/moderate`, { status });
  return data;
}
