export type UserRole = 'BUYER' | 'PRODUCER' | 'MERCHANT' | 'TRANSPORTER' | 'ADMIN' | 'SUPPORT';

export type TrustLevel =
  | 'LEVEL_1_CONTACT_VALIDATED'
  | 'LEVEL_2_IDENTITY_VALIDATED'
  | 'LEVEL_3_ACTIVITY_VALIDATED'
  | 'LEVEL_4_DOCUMENTS_VALIDATED'
  | 'LEVEL_5_FORMALIZATION_VALIDATED';

export type ActivityType =
  | 'AGRICULTOR'
  | 'PESCADOR'
  | 'FABRICANTE'
  | 'ARTESAO'
  | 'CRIADOR'
  | 'PRODUTOR_ALIMENTAR'
  | 'COMERCIANTE_MERCADO'
  | 'COMERCIANTE_RUA'
  | 'REVENDEDOR'
  | 'PRESTADOR_SERVICOS'
  | 'TRANSPORTADOR'
  | 'OUTRO';

export interface User {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  nif: string | null;
  locality: string | null;
  avatarUrl: string | null;
  activityType: ActivityType | null;
  role: UserRole;
  province: string;
  municipality: string;
  trustLevel: TrustLevel;
  isVerifiedBadge: boolean;
  isActive: boolean;
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

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  AGRICULTOR: 'Agricultor',
  PESCADOR: 'Pescador',
  FABRICANTE: 'Fabricante',
  ARTESAO: 'Artesão',
  CRIADOR: 'Criador de gado',
  PRODUTOR_ALIMENTAR: 'Produtor alimentar',
  COMERCIANTE_MERCADO: 'Comerciante de mercado',
  COMERCIANTE_RUA: 'Comerciante de rua/ambulante',
  REVENDEDOR: 'Revendedor',
  PRESTADOR_SERVICOS: 'Prestador de serviços',
  TRANSPORTADOR: 'Transportador',
  OUTRO: 'Outro',
};

// Tipos de actividade relevantes para cada perfil — mostrados como opções contextuais no
// registo (o campo é sempre opcional, nunca bloqueia quem não se revê em nenhuma opção).
export const ACTIVITY_TYPES_BY_ROLE: Partial<Record<UserRole, ActivityType[]>> = {
  PRODUCER: ['AGRICULTOR', 'PESCADOR', 'FABRICANTE', 'ARTESAO', 'CRIADOR', 'PRODUTOR_ALIMENTAR', 'OUTRO'],
  MERCHANT: ['COMERCIANTE_MERCADO', 'COMERCIANTE_RUA', 'REVENDEDOR', 'PRESTADOR_SERVICOS', 'OUTRO'],
};

export const ROLE_DESCRIPTIONS: Record<'BUYER' | 'PRODUCER' | 'MERCHANT' | 'TRANSPORTER', string> = {
  BUYER: 'Encontre produtos, compare opções e compre com segurança.',
  PRODUCER: 'Apresente os seus produtos e alcance novos clientes.',
  MERCHANT: 'Venda os seus produtos e acompanhe a sua actividade.',
  TRANSPORTER: 'Encontre oportunidades de transporte e apresente o seu preço.',
};

// Contas novas têm sempre telefone e email — mas contas internas (ADMIN/SUPPORT) ou dados
// antigos podem só ter um dos dois, por isso usa isto em vez de assumir que .phone existe.
export function getContact(user: { phone: string | null; email: string | null }): string {
  return user.phone ?? user.email ?? '—';
}
