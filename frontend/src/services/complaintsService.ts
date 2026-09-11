import { apiClient } from '../api/client';
import { PaginatedResult } from '../types/marketplace';
import { Complaint, ComplaintStatus, CreateComplaintPayload } from '../types/complaints';

export async function createComplaint(payload: CreateComplaintPayload): Promise<Complaint> {
  const { data } = await apiClient.post<Complaint>('/complaints', payload);
  return data;
}

export async function fetchMyComplaints(): Promise<Complaint[]> {
  const { data } = await apiClient.get<Complaint[]>('/complaints/mine');
  return data;
}

// Uso administrativo/suporte — vê as disputas de todos os utilizadores.
export async function fetchComplaints(
  status?: ComplaintStatus,
  page = 1,
  pageSize = 20,
): Promise<PaginatedResult<Complaint>> {
  const { data } = await apiClient.get<PaginatedResult<Complaint>>('/complaints', {
    params: { status, page, pageSize },
  });
  return data;
}

export async function fetchComplaint(id: string): Promise<Complaint> {
  const { data } = await apiClient.get<Complaint>(`/complaints/${id}`);
  return data;
}

export async function addComplaintMessage(id: string, body: string): Promise<Complaint> {
  const { data } = await apiClient.post<Complaint>(`/complaints/${id}/messages`, { body });
  return data;
}

export async function updateComplaintStatus(
  id: string,
  status: ComplaintStatus,
  resolutionNote?: string,
): Promise<Complaint> {
  const { data } = await apiClient.patch<Complaint>(`/complaints/${id}/status`, { status, resolutionNote });
  return data;
}
