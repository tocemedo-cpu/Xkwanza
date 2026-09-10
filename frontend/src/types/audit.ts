export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  result: 'SUCCESS' | 'FAILURE';
  ipAddress: string | null;
  origin: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user: { id: string; name: string; role: string } | null;
}

export interface AuditLogFilters {
  entity?: string;
  action?: string;
  userId?: string;
  result?: 'SUCCESS' | 'FAILURE';
  page?: number;
  pageSize?: number;
}
