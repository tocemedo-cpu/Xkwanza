import { z } from 'zod';
import { UserRole } from '@prisma/client';
import { ANGOLA_PHONE_REGEX, ANGOLA_PROVINCES } from '../../utils/angola';

const passwordSchema = z
  .string()
  .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres')
  .max(128)
  .regex(/[a-z]/, 'A palavra-passe deve conter uma letra minúscula')
  .regex(/[A-Z]/, 'A palavra-passe deve conter uma letra maiúscula')
  .regex(/[0-9]/, 'A palavra-passe deve conter um número');

// O registo aceita telefone OU email como identificador de conta (o utilizador escolhe
// um dos dois no formulário) — por isso ambos são opcionais ao nível do schema, mas pelo
// menos um tem de estar presente (ver .refine abaixo).
export const registerSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, 'Nome demasiado curto').max(120),
      phone: z.string().regex(ANGOLA_PHONE_REGEX, 'Telefone deve estar no formato +244XXXXXXXXX').optional(),
      email: z.string().trim().toLowerCase().email('Email inválido').optional(),
      password: passwordSchema,
      province: z.enum(ANGOLA_PROVINCES, { errorMap: () => ({ message: 'Província inválida' }) }),
      municipality: z.string().trim().min(2).max(120),
      role: z.nativeEnum(UserRole),
      activityType: z.string().trim().max(60).optional(),
    })
    .refine((data) => Boolean(data.phone) || Boolean(data.email), {
      message: 'Indica um telefone ou um email para criar a conta',
      path: ['phone'],
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

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
