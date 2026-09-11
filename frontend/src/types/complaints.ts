export type ComplaintStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'REJECTED';

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: 'Aberta',
  UNDER_REVIEW: 'Em análise',
  RESOLVED: 'Resolvida',
  REJECTED: 'Rejeitada',
};

export type ComplaintTargetType = 'ORDER' | 'PRODUCT' | 'USER' | 'TRANSPORT_ORDER' | 'OTHER';

export const COMPLAINT_TARGET_TYPE_LABELS: Record<ComplaintTargetType, string> = {
  ORDER: 'Pedido',
  PRODUCT: 'Produto',
  USER: 'Utilizador',
  TRANSPORT_ORDER: 'Frete',
  OTHER: 'Outro',
};

export interface ComplaintUserSummary {
  id: string;
  name: string;
  role: string;
}

export interface ComplaintMessage {
  id: string;
  complaintId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: ComplaintUserSummary;
}

export interface Complaint {
  id: string;
  complainantId: string;
  agentId: string | null;
  targetType: ComplaintTargetType;
  targetId: string | null;
  subject: string;
  description: string;
  status: ComplaintStatus;
  resolutionNote: string | null;
  createdAt: string;
  updatedAt: string;
  complainant: ComplaintUserSummary;
  agent: ComplaintUserSummary | null;
  messages: ComplaintMessage[];
}

export interface CreateComplaintPayload {
  subject: string;
  description: string;
  targetType?: ComplaintTargetType;
  targetId?: string;
}
