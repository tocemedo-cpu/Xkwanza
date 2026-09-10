export type FormalizationStatus =
  | 'NOT_STARTED'
  | 'ACTIVITY_IDENTIFIED'
  | 'IDENTITY_VALIDATED'
  | 'TAX_NIF_IN_PROGRESS'
  | 'SOCIAL_SECURITY_IN_PROGRESS'
  | 'DOCUMENTATION_IN_PROGRESS'
  | 'COMPLETED';

export const FORMALIZATION_STATUS_LABELS: Record<FormalizationStatus, string> = {
  NOT_STARTED: 'Não iniciado',
  ACTIVITY_IDENTIFIED: 'Actividade identificada',
  IDENTITY_VALIDATED: 'Identidade validada',
  TAX_NIF_IN_PROGRESS: 'Registo fiscal (NIF) em curso',
  SOCIAL_SECURITY_IN_PROGRESS: 'Segurança social (INSS) em curso',
  DOCUMENTATION_IN_PROGRESS: 'Documentação em curso',
  COMPLETED: 'Formalização concluída',
};

export type DocumentType =
  | 'IDENTITY'
  | 'DELIVERY_PROOF'
  | 'VEHICLE_DOCUMENT'
  | 'SERVICE_REQUIREMENT'
  | 'RECEIPT'
  | 'OTHER';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  IDENTITY: 'Documento de identidade',
  DELIVERY_PROOF: 'Comprovativo de entrega',
  VEHICLE_DOCUMENT: 'Documento do veículo',
  SERVICE_REQUIREMENT: 'Documentação exigida para o serviço',
  RECEIPT: 'Recibo',
  OTHER: 'Outro',
};

export type DocumentStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  PENDING: 'Pendente',
  UNDER_REVIEW: 'Em análise',
  VERIFIED: 'Verificado',
  REJECTED: 'Rejeitado',
};

export interface FormalizationDiagnosisInput {
  activityDescription: string;
  workLocation: string;
  hasNif: boolean;
  hasInss: boolean;
  worksAlone: boolean;
  hasHelpers: boolean;
  sellsInMarket: boolean;
  worksOnStreet: boolean;
  worksFromHome: boolean;
  worksOnFarm: boolean;
  doesDeliveries: boolean;
  usesOwnVehicle: boolean;
}

export interface FormalizationDiagnosis extends FormalizationDiagnosisInput {
  id: string;
  dossierId: string;
  suggestedNextStep: string;
  createdAt: string;
}

export interface FormalizationStage {
  id: string;
  dossierId: string;
  stageNumber: number;
  name: string;
  completed: boolean;
  completedAt: string | null;
  note: string | null;
}

export interface FormalizationDocument {
  id: string;
  ownerId: string;
  dossierId: string | null;
  type: DocumentType;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt: string | null;
  verifiedBy: string | null;
  owner?: { id: string; name: string; phone: string | null };
}

export interface FormalizationDossier {
  id: string;
  userId: string;
  status: FormalizationStatus;
  activityType: string | null;
  businessName: string | null;
  province: string | null;
  municipality: string | null;
  marketLocation: string | null;
  nif: string | null;
  niss: string | null;
  currentStage: number;
  progress: number;
  diagnosis: FormalizationDiagnosis | null;
  stages: FormalizationStage[];
  documents: FormalizationDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface UpdateDossierPayload {
  businessName?: string;
  province?: string;
  municipality?: string;
  marketLocation?: string;
  nif?: string;
  niss?: string;
}

export interface DossierReadyToFinalize {
  id: string;
  userId: string;
  currentStage: number;
  user: { id: string; name: string; phone: string | null };
}
