import { z } from 'zod';
import { ActivityType } from '@prisma/client';
import { ANGOLA_PROVINCES } from '../../utils/angola';

const NIF_REGEX = /^[A-Za-z0-9]{5,20}$/;

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    province: z.enum(ANGOLA_PROVINCES).optional(),
    municipality: z.string().trim().min(2).max(120).optional(),
    locality: z.string().trim().min(2).max(160).optional(),
    avatarUrl: z.string().trim().url().max(2048).optional(),
    activityType: z.nativeEnum(ActivityType).optional(),
    nif: z.string().trim().regex(NIF_REGEX, 'NIF inválido').optional(),
  }),
});

// Recuperação de conta continua assistida por suporte/administração enquanto não existir
// canal de SMS/email para um fluxo de "esqueci-me da password" self-service.
export const adminResetPasswordSchema = z.object({
  params: z.object({
    id: z.string().uuid('Identificador de utilizador inválido'),
  }),
});

// Bloquear/desbloquear conta (isActive) e validar perfil (isVerifiedBadge) — administração.
export const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Identificador de utilizador inválido'),
  }),
  body: z
    .object({
      isActive: z.boolean().optional(),
      isVerifiedBadge: z.boolean().optional(),
    })
    .refine((data) => data.isActive !== undefined || data.isVerifiedBadge !== undefined, {
      message: 'Indica pelo menos um campo a alterar (isActive ou isVerifiedBadge)',
    }),
});

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>['body'];
