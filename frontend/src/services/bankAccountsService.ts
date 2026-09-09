import { apiClient } from '../api/client';
import { BankAccount, CreateBankAccountPayload } from '../types/payments';

export async function fetchMyBankAccounts(): Promise<BankAccount[]> {
  const { data } = await apiClient.get<BankAccount[]>('/bank-accounts');
  return data;
}

export async function createBankAccount(payload: CreateBankAccountPayload): Promise<BankAccount> {
  const { data } = await apiClient.post<BankAccount>('/bank-accounts', payload);
  return data;
}

export async function deleteBankAccount(id: string): Promise<void> {
  await apiClient.delete(`/bank-accounts/${id}`);
}
