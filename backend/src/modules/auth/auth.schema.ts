import { z } from 'zod';
import { ActivityType, TransporterCategory, UserRole } from '@prisma/client';
import { ANGOLA_PHONE_REGEX, ANGOLA_PROVINCES } from '../../utils/angola';

// NIF angolano: alfanumérico, sem formato oficial validável aqui (auto-declarado, nunca
// verificado contra a AGT) — apenas um comprimento plausível para apanhar erros óbvios de
// digitação.
const NIF_REGEX = /^[A-Za-z0-9]{5,20}$/;

const passwordSchema = z
  .string()
  .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
  .max(128)
  .regex(/[a-z]/, 'A palavra-passe deve conter uma letra minúscula')
  .regex(/[A-Z]/, 'A palavra-passe deve conter uma letra maiúscula')
  .regex(/[0-9]/, 'A palavra-passe deve conter um número');

// Requisitos de cadastro (todos os 4 perfis públicos): nome, telefone, email, palavra-passe,
// NIF, província e município são todos obrigatórios — telefone/email deixaram de ser
// alternativos e o NIF deixou de ser opcional. "Localização da produção" é obrigatória só
// para Produtor; "Endereço/localidade" só para Comprador (ver .superRefine abaixo). Os
// restantes campos por perfil (dados da actividade/negócio/transporte) continuam opcionais,
// para não bloquear quem trabalha informalmente — completam-se depois no perfil.
export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Nome demasiado curto').max(120),
      phone: z.string().regex(ANGOLA_PHONE_REGEX, 'Telefone deve estar no formato +244XXXXXXXXX'),
      email: z.string().trim().toLowerCase().email('Email inválido'),
      password: passwordSchema,
      province: z.enum(ANGOLA_PROVINCES, { errorMap: () => ({ message: 'Província inválida' }) }),
      municipality: z.string().trim().min(2).max(120),
      locality: z.string().trim().min(2).max(160).optional(), // "Endereço/localidade" — obrigatório para Comprador
      role: z.nativeEnum(UserRole),
      activityType: z.nativeEnum(ActivityType).optional(),
      nif: z.string().trim().regex(NIF_REGEX, 'NIF inválido'),

      // Dados do transporte (Transportador) — opcionais, completam-se depois.
      transporterCategory: z.nativeEnum(TransporterCategory).optional(),
      vehicleType: z.string().trim().min(2).max(60).optional(),
      vehiclePlate: z.string().trim().min(4).max(20).optional(),
      cargoCapacity: z.string().trim().min(1).max(60).optional(),
      cargoType: z.string().trim().min(1).max(160).optional(),
      serviceAreas: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
      servicePrice: z.string().trim().min(1).max(80).optional(),

      // Dados da actividade (Produtor) — productionLocation é obrigatório para este perfil
      // (ver .superRefine); os restantes são opcionais.
      productionLocation: z.string().trim().min(2).max(160).optional(),
      businessName: z.string().trim().min(2).max(160).optional(), // partilhado por Produtor e Comerciante
      productCategories: z.array(z.string().trim().min(2).max(60)).max(30).optional(), // Produtor e Comerciante
      productsProduced: z.string().trim().min(2).max(60).array().max(30).optional(),
      productionCapacity: z.string().trim().min(1).max(60).optional(),
      productionUnit: z.string().trim().min(1).max(40).optional(),
      referencePrice: z.string().trim().min(1).max(80).optional(),
      availability: z.string().trim().min(1).max(160).optional(),

      // Dados do negócio (Comerciante) — todos opcionais.
      businessLocation: z.string().trim().min(2).max(160).optional(),
      productsSold: z.array(z.string().trim().min(2).max(60)).max(30).optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role === UserRole.BUYER && !data.locality?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['locality'],
          message: 'Indica o teu endereço/localidade',
        });
      }
      if (data.role === UserRole.PRODUCER && !data.productionLocation?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['productionLocation'],
          message: 'Indica a localização da produção',
        });
      }
    }),
});

// O login usa um único campo "identifier" — pode ser o telefone (+244XXXXXXXXX) ou o
// email da conta; o serviço decide qual é ao procurar o utilizador (auth.service.ts).
export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(3, 'Indica o teu telefone ou email'),
    password: z.string().min(1, 'Palavra-passe obrigatória'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Token de renovação obrigatório'),
  }),
});

export const requestPasswordResetSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(3, 'Indica o teu telefone ou email'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().trim().min(10, 'Código de recuperação inválido').max(256),
    password: passwordSchema,
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
