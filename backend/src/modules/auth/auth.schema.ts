import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { ANGOLA_PHONE_REGEX, ANGOLA_PROVINCES } from '../../utils/angola';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Nome demasiado curto').max(120),
    phone: z.string().regex(ANGOLA_PHONE_REGEX, 'Telefone deve estar no formato +244XXXXXXXXX'),
    email: z.string().trim().toLowerCase().email('Email inválido').optional(),
    password: z
      .string()
      .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
      .max(128)
      .regex(/[a-z]/, 'A palavra-passe deve conter uma letra minúscula')
      .regex(/[A-Z]/, 'A palavra-passe deve conter uma letra maiúscula')
      .regex(/[0-9]/, 'A palavra-passe deve conter um número'),
    province: z.enum(ANGOLA_PROVINCES, { errorMap: () => ({ message: 'Província inválida' }) }),
    municipality: z.string().trim().min(2).max(120),
    role: z.nativeEnum(UserRole),
    activityType: z.string().trim().max(60).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    phone: z.string().regex(ANGOLA_PHONE_REGEX, 'Telefone deve estar no formato +244XXXXXXXXX'),
    password: z.string().min(1, 'Palavra-passe obrigatória'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Token de renovação obrigatório'),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
