import { apiClient } from '../api/client';
import { Transporter, UpsertTransporterPayload } from '../types/logistics';

export async function fetchMyTransporterProfile(): Promise<Transporter | null> {
  try {
    const { data } = await apiClient.get<Transporter>('/transporters/me');
    return data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertMyTransporterProfile(payload: UpsertTransporterPayload): Promise<Transporter> {
  const { data } = await apiClient.put<Transporter>('/transporters/me', payload);
  return data;
}

export async function setMyAvailability(isAvailable: boolean): Promise<Transporter> {
  const { data } = await apiClient.patch<Transporter>('/transporters/me/availability', { isAvailable });
  return data;
}
