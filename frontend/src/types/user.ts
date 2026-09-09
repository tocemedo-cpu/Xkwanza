export type UserRole = 'BUYER' | 'PRODUCER' | 'MERCHANT' | 'TRANSPORTER' | 'ADMIN' | 'SUPPORT';

export type TrustLevel =
  | 'LEVEL_1_CONTACT_VALIDATED'
  | 'LEVEL_2_IDENTITY_VALIDATED'
  | 'LEVEL_3_ACTIVITY_VALIDATED'
  | 'LEVEL_4_DOCUMENTS_VALIDATED'
  | 'LEVEL_5_FORMALIZATION_VALIDATED';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  province: string;
  municipality: string;
  trustLevel: TrustLevel;
  isVerifiedBadge: boolean;
  createdAt: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  BUYER: 'Comprador',
  PRODUCER: 'Produtor',
  MERCHANT: 'Comerciante',
  TRANSPORTER: 'Transportador',
  ADMIN: 'Administrador',
  SUPPORT: 'Suporte',
};

// Perfis disponíveis para auto-registo público (ADMIN e SUPPORT são criados internamente).
export const SELF_REGISTRABLE_ROLES: UserRole[] = ['BUYER', 'PRODUCER', 'MERCHANT', 'TRANSPORTER'];
