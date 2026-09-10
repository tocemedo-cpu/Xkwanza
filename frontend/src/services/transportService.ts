import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { CreateProposalPayload, TransportOrder, TransportProposal } from '../types/logistics';

export async function requestTransport(orderId: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>('/transport-orders', { orderId });
  return data;
}

export async function fetchOpenTransportOrders(
  province?: string,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<TransportOrder>> {
  const { data } = await apiClient.get<PaginatedResult<TransportOrder>>('/transport-orders/open', {
    params: { province, page, pageSize },
  });
  return data;
}

export async function fetchMyAssignedJobs(): Promise<TransportOrder[]> {
  const { data } = await apiClient.get<TransportOrder[]>('/transport-orders/mine');
  return data;
}

export async function fetchMyProposals(): Promise<(TransportProposal & { transportOrder: TransportOrder })[]> {
  const { data } = await apiClient.get<(TransportProposal & { transportOrder: TransportOrder })[]>(
    '/transport-orders/my-proposals',
  );
  return data;
}

export async function fetchTransportOrder(id: string): Promise<TransportOrder> {
  const { data } = await apiClient.get<TransportOrder>(`/transport-orders/${id}`);
  return data;
}

export async function fetchProposals(transportOrderId: string): Promise<TransportProposal[]> {
  const { data } = await apiClient.get<TransportProposal[]>(`/transport-orders/${transportOrderId}/proposals`);
  return data;
}

export async function submitProposal(
  transportOrderId: string,
  payload: CreateProposalPayload,
): Promise<TransportProposal> {
  const { data } = await apiClient.post<TransportProposal>(
    `/transport-orders/${transportOrderId}/proposals`,
    payload,
  );
  return data;
}

export async function acceptProposal(transportOrderId: string, proposalId: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(
    `/transport-orders/${transportOrderId}/proposals/${proposalId}/accept`,
  );
  return data;
}

export async function acceptAssignment(transportOrderId: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(`/transport-orders/${transportOrderId}/accept`);
  return data;
}

export async function confirmPickup(transportOrderId: string, otp: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(`/transport-orders/${transportOrderId}/confirm-pickup`, {
    otp,
  });
  return data;
}

export async function startTransit(transportOrderId: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(`/transport-orders/${transportOrderId}/start-transit`);
  return data;
}

export async function confirmDelivery(transportOrderId: string, otp: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(`/transport-orders/${transportOrderId}/confirm-delivery`, {
    otp,
  });
  return data;
}

export async function cancelTransportOrder(transportOrderId: string): Promise<TransportOrder> {
  const { data } = await apiClient.post<TransportOrder>(`/transport-orders/${transportOrderId}/cancel`);
  return data;
}

// Uso administrativo — visão geral de todas as entregas/fretes da plataforma.
export async function fetchTransportOrdersForAdmin(page = 1, pageSize = 30): Promise<PaginatedResult<TransportOrder>> {
  const { data } = await apiClient.get<PaginatedResult<TransportOrder>>('/transport-orders/admin', {
    params: { page, pageSize },
  });
  return data;
}
