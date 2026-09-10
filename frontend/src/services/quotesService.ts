import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { CreateQuoteProposalPayload, CreateQuoteRequestPayload, QuoteRequest } from '../types/quotes';

export async function createQuoteRequest(payload: CreateQuoteRequestPayload): Promise<QuoteRequest> {
  const { data } = await apiClient.post<QuoteRequest>('/quotes', payload);
  return data;
}

export async function fetchMyQuoteRequests(): Promise<QuoteRequest[]> {
  const { data } = await apiClient.get<QuoteRequest[]>('/quotes/mine');
  return data;
}

// Vendedores — negociações abertas a que podem responder.
export async function fetchOpenQuotesForSeller(): Promise<QuoteRequest[]> {
  const { data } = await apiClient.get<QuoteRequest[]>('/quotes');
  return data;
}

export async function fetchQuoteRequest(id: string): Promise<QuoteRequest> {
  const { data } = await apiClient.get<QuoteRequest>(`/quotes/${id}`);
  return data;
}

export async function createQuoteProposal(id: string, payload: CreateQuoteProposalPayload): Promise<QuoteRequest> {
  const { data } = await apiClient.post<QuoteRequest>(`/quotes/${id}/proposals`, payload);
  return data;
}

export async function acceptQuoteProposal(id: string, proposalId: string): Promise<QuoteRequest> {
  const { data } = await apiClient.post<QuoteRequest>(`/quotes/${id}/proposals/${proposalId}/accept`);
  return data;
}

export async function cancelQuoteRequest(id: string): Promise<QuoteRequest> {
  const { data } = await apiClient.patch<QuoteRequest>(`/quotes/${id}/cancel`);
  return data;
}

// Uso administrativo — supervisão de todas as negociações.
export async function fetchQuotesForAdmin(page = 1, pageSize = 20): Promise<PaginatedResult<QuoteRequest>> {
  const { data } = await apiClient.get<PaginatedResult<QuoteRequest>>('/quotes/admin', { params: { page, pageSize } });
  return data;
}
