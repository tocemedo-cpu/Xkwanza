import { apiClient } from '../api/client';
import { Address, CreateAddressPayload } from '../types/marketplace';

export async function fetchMyAddresses(): Promise<Address[]> {
  const { data } = await apiClient.get<Address[]>('/addresses');
  return data;
}

export async function createAddress(payload: CreateAddressPayload): Promise<Address> {
  const { data } = await apiClient.post<Address>('/addresses', payload);
  return data;
}

export async function deleteAddress(id: string): Promise<void> {
  await apiClient.delete(`/addresses/${id}`);
}
