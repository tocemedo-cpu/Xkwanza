export type QuoteStatus = 'OPEN' | 'PROPOSALS_RECEIVED' | 'NEGOTIATING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  OPEN: 'Aberta',
  PROPOSALS_RECEIVED: 'Com propostas',
  NEGOTIATING: 'Em negociação',
  ACCEPTED: 'Aceite',
  EXPIRED: 'Expirada',
  CANCELLED: 'Cancelada',
};

export interface QuoteRequester {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
}

export interface QuoteProposal {
  id: string;
  quoteRequestId: string;
  proposerId: string;
  price: string;
  message: string | null;
  accepted: boolean;
  createdAt: string;
  proposer: QuoteRequester;
}

export interface QuoteRequest {
  id: string;
  requesterId: string;
  productId: string | null;
  description: string;
  quantity: string;
  deadline: string | null;
  status: QuoteStatus;
  createdAt: string;
  updatedAt: string;
  requester: QuoteRequester;
  product: { id: string; name: string; ownerId: string } | null;
  proposals: QuoteProposal[];
}

export interface CreateQuoteRequestPayload {
  productId?: string;
  description: string;
  quantity: number;
  deadline?: string;
}

export interface CreateQuoteProposalPayload {
  price: number;
  message?: string;
}
