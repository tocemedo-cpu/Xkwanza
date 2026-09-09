import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// Métodos seleccionáveis pelo comprador no checkout — BANK_INTEGRATION/FINTECH_INTEGRATION
// ficam reservados para quando existir integração institucional real (Fase 8/9).
const CHECKOUT_PAYMENT_METHODS = [
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.PAYMENT_REFERENCE,
  PaymentMethod.WALLET,
] as const;

export const createOrderSchema = z.object({
  body: z.object({
    shippingAddressId: z.string().uuid(),
    paymentMethod: z.enum(CHECKOUT_PAYMENT_METHODS),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive().max(100_000),
        }),
      )
      .min(1, 'O pedido deve ter pelo menos um item')
      .max(50),
  }),
});

export const orderIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const updateOrderStatusSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
    note: z.string().trim().max(500).optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
