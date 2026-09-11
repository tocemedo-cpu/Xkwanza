import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as paymentsService from './payments.service';

export const markPaymentSentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const payment = await paymentsService.markPaymentSent(req.user.id, req.params.orderId, req);
  res.status(200).json(payment);
});

export const confirmPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const payment = await paymentsService.confirmPayment(req.user.id, req.params.orderId, req);
  res.status(200).json(payment);
});

export const rejectPaymentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const payment = await paymentsService.rejectPayment(req.user.id, req.params.orderId, req);
  res.status(200).json(payment);
});

export const listPendingPaymentsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await paymentsService.listPendingPayments(req.query as never);
  res.status(200).json(result);
});

export const gatewayWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
  const payment = await paymentsService.handleGatewayWebhook(
    req.body,
    JSON.stringify(req.body),
    req.header('x-gateway-signature'),
  );
  res.status(200).json({ received: true, paymentId: payment.id });
});
