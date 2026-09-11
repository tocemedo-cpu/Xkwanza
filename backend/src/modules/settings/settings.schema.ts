import { z } from 'zod';

// Minúsculas, dígitos, underscore, ponto e hífen — mantém as chaves previsíveis e seguras para
// uso directo em URLs (ex: "commission.default", "payments_enabled").
const settingKeyRegex = /^[a-z0-9_.-]{2,80}$/;

export const settingKeyParamSchema = z.object({
  params: z.object({
    key: z.string().regex(settingKeyRegex, 'Chave inválida — use apenas minúsculas, números, "_", "." ou "-"'),
  }),
});

export const upsertSettingSchema = z.object({
  params: z.object({
    key: z.string().regex(settingKeyRegex, 'Chave inválida — use apenas minúsculas, números, "_", "." ou "-"'),
  }),
  body: z.object({
    value: z.string().trim().min(1).max(2000),
  }),
});

export type SettingKeyParamInput = z.infer<typeof settingKeyParamSchema>['params'];
export type UpsertSettingInput = z.infer<typeof upsertSettingSchema>['body'];
