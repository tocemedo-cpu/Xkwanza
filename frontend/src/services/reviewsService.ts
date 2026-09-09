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

export async function fetchProductReviews(productId: string, page = 1, pageSize = 20): Promise<PaginatedResult<Review>> {
  const { data } = await apiClient.get<PaginatedResult<Review>>(`/reviews/product/${productId}`, {
    params: { page, pageSize },
  });
  return data;
}
