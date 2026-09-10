export type INSSStatus =
  | 'NOT_STARTED'
  | 'CONSENT_PENDING'
  | 'READY'
  | 'SUBMITTED'
  | 'INSS_PENDING'
  | 'VERIFIED'
  | 'REJECTED'
  | 'NEEDS_CORRECTION'
  | 'SUSPENDED'
  | 'EXPIRED';

export const INSS_STATUS_LABELS: Record<INSSStatus, string> = {
  NOT_STARTED: 'Não iniciado',
  CONSENT_PENDING: 'Consentimento pendente',
  READY: 'Pronto para submeter',
  SUBMITTED: 'Submetido (simulado)',
  INSS_PENDING: 'Em processamento simulado',
  VERIFIED: 'Verificado',
  REJECTED: 'Rejeitado',
  NEEDS_CORRECTION: 'Precisa de correcção',
  SUSPENDED: 'Suspenso',
  EXPIRED: 'Expirado',
};

export type INSSDocumentType = 'IDENTITY' | 'DELIVERY_PROOF' | 'VEHICLE_DOCUMENT' | 'RECEIPT' | 'OTHER';
export type INSSDocumentStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface INSSConsent {
  id: string;
  linkageId: string;
  purpose: string;
  authorizedData: string[];
  version: string;
  grantedAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  origin: string;
}

export interface INSSSyncEvent {
  id: string;
  linkageId: string;
  eventType: string;
  success: boolean;
  message: string | null;
  createdAt: string;
}

export interface INSSDocument {
  id: string;
  linkageId: string;
  type: INSSDocumentType;
  fileUrl: string;
  status: INSSDocumentStatus;
  uploadedAt: string;
  verifiedAt: string | null;
  linkage?: { user: { id: string; name: string; phone: string | null } };
}

export interface INSSSimulation {
  id: string;
  linkageId: string;
  declaredBase: string;
  contributionRate: string;
  monthlyContribution: string;
  annualContribution: string;
  regime: string;
  isSimulationOnly: boolean;
  createdAt: string;
}

export interface INSSLinkage {
  id: string;
  userId: string;
  niss: string | null;
  status: INSSStatus;
  adapterMode: 'SANDBOX' | 'PRODUCTION';
  lastSyncedAt: string | null;
  consents: INSSConsent[];
  syncEvents: INSSSyncEvent[];
  documents: INSSDocument[];
  simulations: INSSSimulation[];
  createdAt: string;
  updatedAt: string;
}

export interface GrantConsentPayload {
  purpose: string;
  authorizedData: string[];
  origin?: string;
}

export interface CreateSimulationPayload {
  declaredBase: number;
  contributionRate: number;
  regime: string;
}
