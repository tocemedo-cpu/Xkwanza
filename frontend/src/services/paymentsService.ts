import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { Payment, PendingPaymentOrder } from '../types/payments';

export async function markPaymentSent(orderId: string): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(`/payments/${orderId}/mark-sent`);
  return data;
}

export async function confirmPayment(orderId: string): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(`/payments/${orderId}/confirm`);
  return data;
}

export async function rejectPayment(orderId: string): Promise<Payment> {
  const { data } = await apiClient.post<Payment>(`/payments/${orderId}/reject`);
  return data;
}

export async function fetchPendingPayments(page = 1, pageSize = 20): Promise<PaginatedResult<PendingPaymentOrder>> {
  const { data } = await apiClient.get<PaginatedResult<PendingPaymentOrder>>('/payments/pending', {
    params: { page, pageSize },
  });
  return data;
}
