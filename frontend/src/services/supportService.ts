import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { CreateTicketPayload, SupportTicket, SupportTicketStatus } from '../types/support';

export async function createTicket(payload: CreateTicketPayload): Promise<SupportTicket> {
  const { data } = await apiClient.post<SupportTicket>('/support/tickets', payload);
  return data;
}

export async function fetchMyTickets(): Promise<SupportTicket[]> {
  const { data } = await apiClient.get<SupportTicket[]>('/support/tickets/mine');
  return data;
}

// Uso administrativo — vê os tickets de todos os utilizadores.
export async function fetchTickets(status?: SupportTicketStatus): Promise<PaginatedResult<SupportTicket>> {
  const { data } = await apiClient.get<PaginatedResult<SupportTicket>>('/support/tickets', {
    params: { status, pageSize: 50 },
  });
  return data;
}

export async function fetchTicket(id: string): Promise<SupportTicket> {
  const { data } = await apiClient.get<SupportTicket>(`/support/tickets/${id}`);
  return data;
}

export async function addTicketMessage(id: string, body: string): Promise<SupportTicket> {
  const { data } = await apiClient.post<SupportTicket>(`/support/tickets/${id}/messages`, { body });
  return data;
}

export async function updateTicketStatus(id: string, status: SupportTicketStatus): Promise<SupportTicket> {
  const { data } = await apiClient.patch<SupportTicket>(`/support/tickets/${id}/status`, { status });
  return data;
}
