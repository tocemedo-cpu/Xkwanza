import { apiClient } from '../api/client';
import { Wallet } from '../types/payments';

export async function fetchMyWallet(): Promise<Wallet> {
  const { data } = await apiClient.get<Wallet>('/wallet/me');
  return data;
}
