import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { CreateReviewPayload, Review } from '../types/reviews';

export async function createReview(payload: CreateReviewPayload): Promise<Review> {
  const { data } = await apiClient.post<Review>('/reviews', payload);
  return data;
}

export async function fetchMyReviewsForOrder(orderId: string): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>(`/reviews/mine/${orderId}`);
  return data;
}

// "Minhas avaliações" — todas as avaliações escritas pelo próprio utilizador.
export async function fetchMyReviews(): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>('/reviews/mine');
  return data;
}

// Avaliações recebidas — vendedor/transportador vê o que disseram sobre eles.
export async function fetchReceivedReviews(): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>('/reviews/received');
  return data;
}

// Uso administrativo — modera avaliações de qualquer utilizador.
export async function fetchAllReviewsForAdmin(): Promise<Review[]> {
  const { data } = await apiClient.get<Review[]>('/reviews/admin');
  return data;
}

export async function deleteReview(id: string): Promise<void> {
  await apiClient.delete(`/reviews/${id}`);
}

export async function fetchProductReviews(productId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Review>> {
  const { data } = await apiClient.get<PaginatedResult<Review>>(`/reviews/product/${productId}`, {
    params: { page, pageSize },
  });
  return data;
}
