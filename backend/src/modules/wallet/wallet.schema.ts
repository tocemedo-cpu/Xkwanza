import { z } from 'zod';

export const creditWalletSchema = z.object({
  params: z.object({ userId: z.string().uuid() }),
  body: z.object({
    amount: z.number().positive().max(999_999_999),
    note: z.string().trim().max(255).optional(),
  }),
});

export type CreditWalletInput = z.infer<typeof creditWalletSchema>['body'];
