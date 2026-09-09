import { apiClient } from '../api/client';
import { SellerStats, TransporterStats } from '../types/reviews';

export async function fetchSellerStats(): Promise<SellerStats> {
  const { data } = await apiClient.get<SellerStats>('/economics/seller');
  return data;
}

export async function fetchTransporterStats(): Promise<TransporterStats> {
  const { data } = await apiClient.get<TransporterStats>('/economics/transporter');
  return data;
}
