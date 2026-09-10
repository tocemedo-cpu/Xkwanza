import { apiClient } from '../api/client';
import { ProducerProfile, UpsertProducerPayload } from '../types/producers';

export async function fetchMyProducerProfile(): Promise<ProducerProfile | null> {
  try {
    const { data } = await apiClient.get<ProducerProfile>('/producers/me');
    return data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertMyProducerProfile(payload: UpsertProducerPayload): Promise<ProducerProfile> {
  const { data } = await apiClient.put<ProducerProfile>('/producers/me', payload);
  return data;
}
