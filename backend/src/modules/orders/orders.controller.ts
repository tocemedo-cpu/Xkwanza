import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as ordersService from './orders.service';

function pagination(req: Request) {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 50);
  return { page, pageSize };
}

export const checkoutHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const order = await ordersService.checkout(req.user.id, req.body, req);
  res.status(201).json(order);
});

export const listMyOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { page, pageSize } = pagination(req);
  const result = await ordersService.listMyOrdersAsBuyer(req.user.id, page, pageSize);
  res.status(200).json(result);
});

export const listReceivedOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const { page, pageSize } = pagination(req);
  const result = await ordersService.listReceivedOrders(req.user.id, page, pageSize);
  res.status(200).json(result);
});

export const getOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const order = await ordersService.getOrderForUser(req.params.id, req.user.id, req.user.role);
  res.status(200).json(order);
});

export const updateOrderStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const order = await ordersService.updateOrderStatus(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body.status,
    req.body.note,
    req,
  );
  res.status(200).json(order);
});
