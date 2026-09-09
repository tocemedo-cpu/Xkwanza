import { apiClient } from '../api/client';
import {
  CreateSimulationPayload,
  GrantConsentPayload,
  INSSDocument,
  INSSLinkage,
  INSSSimulation,
} from '../types/inss';
import { DocumentType } from '../types/formalization';

export async function fetchMyLinkage(): Promise<INSSLinkage> {
  const { data } = await apiClient.get<INSSLinkage>('/inss/linkage/me');
  return data;
}

export async function grantConsent(payload: GrantConsentPayload): Promise<INSSLinkage> {
  const { data } = await apiClient.post<INSSLinkage>('/inss/consent', payload);
  return data;
}

export async function revokeConsent(consentId: string): Promise<INSSLinkage> {
  const { data } = await apiClient.post<INSSLinkage>(`/inss/consent/${consentId}/revoke`);
  return data;
}

export async function updateNiss(niss: string): Promise<INSSLinkage> {
  const { data } = await apiClient.patch<INSSLinkage>('/inss/linkage/me/niss', { niss });
  return data;
}

export async function submitLinkage(): Promise<INSSLinkage> {
  const { data } = await apiClient.post<INSSLinkage>('/inss/linkage/me/submit');
  return data;
}

export async function syncStatus(): Promise<INSSLinkage> {
  const { data } = await apiClient.post<INSSLinkage>('/inss/linkage/me/sync');
  return data;
}

export async function createDocument(type: DocumentType, fileUrl: string): Promise<INSSDocument> {
  const { data } = await apiClient.post<INSSDocument>('/inss/documents', { type, fileUrl });
  return data;
}

export async function fetchPendingDocuments(): Promise<INSSDocument[]> {
  const { data } = await apiClient.get<INSSDocument[]>('/inss/documents/pending');
  return data;
}

export async function verifyDocument(id: string): Promise<INSSDocument> {
  const { data } = await apiClient.post<INSSDocument>(`/inss/documents/${id}/verify`);
  return data;
}

export async function rejectDocument(id: string): Promise<INSSDocument> {
  const { data } = await apiClient.post<INSSDocument>(`/inss/documents/${id}/reject`);
  return data;
}

export async function createSimulation(payload: CreateSimulationPayload): Promise<INSSSimulation> {
  const { data } = await apiClient.post<INSSSimulation>('/inss/simulations', payload);
  return data;
}
