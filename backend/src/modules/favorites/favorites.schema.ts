import { z } from 'zod';

export const productIdParamSchema = z.object({
  params: z.object({ productId: z.string().uuid('Identificador inválido') }),
});
