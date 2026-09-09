import { apiClient } from '../api/client';
import {
  DocumentType,
  DossierReadyToFinalize,
  FormalizationDiagnosisInput,
  FormalizationDocument,
  FormalizationDossier,
  UpdateDossierPayload,
} from '../types/formalization';

export async function submitDiagnosis(input: FormalizationDiagnosisInput): Promise<FormalizationDossier> {
  const { data } = await apiClient.post<FormalizationDossier>('/formalization/diagnosis', input);
  return data;
}

export async function fetchMyDossier(): Promise<FormalizationDossier | null> {
  try {
    const { data } = await apiClient.get<FormalizationDossier>('/formalization/dossier/me');
    return data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function updateDossier(payload: UpdateDossierPayload): Promise<FormalizationDossier> {
  const { data } = await apiClient.patch<FormalizationDossier>('/formalization/dossier/me', payload);
  return data;
}

export async function completeStage(stageNumber: number): Promise<FormalizationDossier> {
  const { data } = await apiClient.post<FormalizationDossier>(`/formalization/stages/${stageNumber}/complete`);
  return data;
}

export async function finalizeDossier(userId: string): Promise<FormalizationDossier> {
  const { data } = await apiClient.post<FormalizationDossier>(`/formalization/dossier/${userId}/finalize`);
  return data;
}

export async function fetchDossiersReadyToFinalize(): Promise<DossierReadyToFinalize[]> {
  const { data } = await apiClient.get<DossierReadyToFinalize[]>('/formalization/dossiers/ready-to-finalize');
  return data;
}

export async function createDocument(type: DocumentType, fileUrl: string): Promise<FormalizationDocument> {
  const { data } = await apiClient.post<FormalizationDocument>('/formalization/documents', { type, fileUrl });
  return data;
}

export async function fetchMyDocuments(): Promise<FormalizationDocument[]> {
  const { data } = await apiClient.get<FormalizationDocument[]>('/formalization/documents/mine');
  return data;
}

export async function fetchPendingDocuments(): Promise<FormalizationDocument[]> {
  const { data } = await apiClient.get<FormalizationDocument[]>('/formalization/documents/pending');
  return data;
}

export async function verifyDocument(id: string): Promise<FormalizationDocument> {
  const { data } = await apiClient.post<FormalizationDocument>(`/formalization/documents/${id}/verify`);
  return data;
}

export async function rejectDocument(id: string): Promise<FormalizationDocument> {
  const { data } = await apiClient.post<FormalizationDocument>(`/formalization/documents/${id}/reject`);
  return data;
}
