import { z } from 'zod';
import { OrderStatus, PaymentMethod } from '@prisma/client';

// Métodos seleccionáveis pelo comprador no checkout. BANK_INTEGRATION/FINTECH_INTEGRATION
// passam pelo payment.adapter.ts — em sandbox (modo por omissão) simulam uma cobrança iniciada,
// nunca ligam a um banco/fintech real sem esse acordo institucional e credenciais reais.
const CHECKOUT_PAYMENT_METHODS = [
  PaymentMethod.BANK_TRANSFER,
  PaymentMethod.PAYMENT_REFERENCE,
  PaymentMethod.WALLET,
  PaymentMethod.BANK_INTEGRATION,
  PaymentMethod.FINTECH_INTEGRATION,
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

// Uso administrativo — vê todos os pedidos, não só os próprios.
export const adminListOrdersQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(OrderStatus).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>['body'];
export type AdminListOrdersQuery = z.infer<typeof adminListOrdersQuerySchema>['query'];
