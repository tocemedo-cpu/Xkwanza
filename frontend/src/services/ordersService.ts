import { apiClient } from '../api/client';
import { CheckoutPayload, Order, OrderStatus, PaginatedResult } from '../types/marketplace';

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const { data } = await apiClient.post<Order>('/orders', payload);
  return data;
}

export async function fetchMyOrders(page = 1, pageSize = 20): Promise<PaginatedResult<Order>> {
  const { data } = await apiClient.get<PaginatedResult<Order>>('/orders/mine', { params: { page, pageSize } });
  return data;
}

export async function fetchReceivedOrders(page = 1, pageSize = 20): Promise<PaginatedResult<Order>> {
  const { data } = await apiClient.get<PaginatedResult<Order>>('/orders/received', { params: { page, pageSize } });
  return data;
}

export async function fetchOrder(id: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${id}`);
  return data;
}

export async function updateOrderStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
  const { data } = await apiClient.patch<Order>(`/orders/${id}/status`, { status, note });
  return data;
}

// Uso administrativo — vê todos os pedidos da plataforma.
export async function fetchOrdersForAdmin(status?: OrderStatus, page = 1, pageSize = 20): Promise<PaginatedResult<Order>> {
  const { data } = await apiClient.get<PaginatedResult<Order>>('/orders/admin', { params: { status, page, pageSize } });
  return data;
}
