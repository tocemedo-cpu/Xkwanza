import { apiClient } from '../api/client';
import { AuditLog, AuditLogFilters } from '../types/audit';
import { PaginatedResult } from '../types/marketplace';

export async function fetchAuditLogs(filters: AuditLogFilters): Promise<PaginatedResult<AuditLog>> {
  const { data } = await apiClient.get<PaginatedResult<AuditLog>>('/audit-logs', { params: filters });
  return data;
}
