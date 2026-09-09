import { z } from 'zod';

export const createBankAccountSchema = z.object({
  body: z.object({
    bankName: z.string().trim().min(2).max(120),
    iban: z.string().trim().max(40).optional(),
    accountHolder: z.string().trim().min(2).max(160),
    isDefault: z.boolean().optional(),
  }),
});

export const bankAccountIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export type CreateBankAccountInput = z.infer<typeof createBankAccountSchema>['body'];
