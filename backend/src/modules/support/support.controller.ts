import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as supportService from './support.service';

export const createTicketHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const ticket = await supportService.createTicket(req.user.id, req.body, req);
  res.status(201).json(ticket);
});

export const listMyTicketsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const tickets = await supportService.listMyTickets(req.user.id);
  res.status(200).json(tickets);
});

export const listTicketsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await supportService.listTickets(req.query as never);
  res.status(200).json(result);
});

export const getTicketHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const ticket = await supportService.getTicket(req.params.id, req.user.id, req.user.role);
  res.status(200).json(ticket);
});

export const addMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const ticket = await supportService.addMessage(req.params.id, req.user.id, req.user.role, req.body, req);
  res.status(200).json(ticket);
});

export const updateTicketStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const ticket = await supportService.updateTicketStatus(req.params.id, req.user.id, req.body, req);
  res.status(200).json(ticket);
});
