import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as quotesService from './quotes.service';

export const createQuoteRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quote = await quotesService.createQuoteRequest(req.user.id, req.body, req);
  res.status(201).json(quote);
});

export const listMyQuoteRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quotes = await quotesService.listMyQuoteRequests(req.user.id);
  res.status(200).json(quotes);
});

export const listOpenQuotesForSellerHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quotes = await quotesService.listOpenQuotesForSeller(req.user.id, req.user.role);
  res.status(200).json(quotes);
});

export const getQuoteRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quote = await quotesService.getQuoteRequest(req.params.id, req.user.id, req.user.role);
  res.status(200).json(quote);
});

export const createProposalHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quote = await quotesService.createProposal(req.params.id, req.user.id, req.user.role, req.body, req);
  res.status(200).json(quote);
});

export const acceptProposalHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quote = await quotesService.acceptProposal(req.params.id, req.params.proposalId, req.user.id, req);
  res.status(200).json(quote);
});

export const cancelQuoteRequestHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const quote = await quotesService.cancelQuoteRequest(req.params.id, req.user.id, req);
  res.status(200).json(quote);
});

export const listQuotesForAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await quotesService.listQuotesForAdmin(req.query as never);
  res.status(200).json(result);
});
