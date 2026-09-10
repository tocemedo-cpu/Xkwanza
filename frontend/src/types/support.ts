export type SupportTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_USER' | 'RESOLVED' | 'CLOSED';

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em curso',
  WAITING_ON_USER: 'Aguarda o utilizador',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

export interface SupportTicketUserSummary {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role?: string;
}

export interface SupportTicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author: SupportTicketUserSummary;
}

export interface SupportTicket {
  id: string;
  requesterId: string;
  agentId: string | null;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  createdAt: string;
  updatedAt: string;
  requester: SupportTicketUserSummary;
  agent: SupportTicketUserSummary | null;
  messages: SupportTicketMessage[];
}

export interface CreateTicketPayload {
  subject: string;
  description: string;
}
