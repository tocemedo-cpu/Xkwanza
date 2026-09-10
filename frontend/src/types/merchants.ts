export type SelfDeclaredFormalizationState = 'INFORMAL' | 'EM_FORMALIZACAO' | 'FORMALIZADO';

export const FORMALIZATION_STATE_LABELS: Record<SelfDeclaredFormalizationState, string> = {
  INFORMAL: 'Informal',
  EM_FORMALIZACAO: 'Em formalização',
  FORMALIZADO: 'Formalizado',
};

export interface MerchantProfile {
  id: string;
  userId: string;
  businessName: string | null;
  businessLocation: string | null;
  productCategories: string[];
  productsSold: string[];
  formalizationState: SelfDeclaredFormalizationState;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertMerchantPayload {
  businessName?: string;
  businessLocation?: string;
  productCategories?: string[];
  productsSold?: string[];
  formalizationState?: SelfDeclaredFormalizationState;
}
