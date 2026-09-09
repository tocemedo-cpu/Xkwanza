import { z } from 'zod';
import { ANGOLA_PROVINCES } from '../../utils/angola';

export const createTransportOrderSchema = z.object({
  body: z.object({
    orderId: z.string().uuid(),
  }),
});

export const transportOrderIdParamSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
});

export const listOpenTransportOrdersQuerySchema = z.object({
  query: z.object({
    province: z.enum(ANGOLA_PROVINCES).optional(),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(50).default(20),
  }),
});

export const createProposalSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    price: z.number().positive().max(999_999_999),
    message: z.string().trim().max(500).optional(),
  }),
});

export const acceptProposalParamSchema = z.object({
  params: z.object({ id: z.string().uuid(), proposalId: z.string().uuid() }),
});

const OTP_REGEX = /^\d{6}$/;

export const otpSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    otp: z.string().regex(OTP_REGEX, 'Código deve ter 6 dígitos'),
  }),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>['body'];
export type ListOpenTransportOrdersQuery = z.infer<typeof listOpenTransportOrdersQuerySchema>['query'];
