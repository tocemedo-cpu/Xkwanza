import { apiClient } from '../api/client';
import { MerchantProfile, UpsertMerchantPayload } from '../types/merchants';

export async function fetchMyMerchantProfile(): Promise<MerchantProfile | null> {
  try {
    const { data } = await apiClient.get<MerchantProfile>('/merchants/me');
    return data;
  } catch (err: unknown) {
    if ((err as { response?: { status?: number } })?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertMyMerchantProfile(payload: UpsertMerchantPayload): Promise<MerchantProfile> {
  const { data } = await apiClient.put<MerchantProfile>('/merchants/me', payload);
  return data;
}
