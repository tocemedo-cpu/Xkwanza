import { apiClient } from '../api/client';
import { SellerStats, TransporterStats } from '../types/reviews';
import { PlatformReport } from '../types/economics';

export async function fetchSellerStats(): Promise<SellerStats> {
  const { data } = await apiClient.get<SellerStats>('/economics/seller');
  return data;
}

export async function fetchTransporterStats(): Promise<TransporterStats> {
  const { data } = await apiClient.get<TransporterStats>('/economics/transporter');
  return data;
}

// Uso administrativo — indicadores agregados de toda a plataforma.
export async function fetchPlatformReport(): Promise<PlatformReport> {
  const { data } = await apiClient.get<PlatformReport>('/economics/admin');
  return data;
}
