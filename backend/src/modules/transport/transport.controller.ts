import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as transportService from './transport.service';

export const requestTransportHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.requestTransport(req.user.id, req.body.orderId, req);
  res.status(201).json(transportOrder);
});

export const listOpenTransportOrdersHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  if (req.user.role !== 'TRANSPORTER') throw ApiError.forbidden('Apenas transportadores podem ver fretes disponíveis');
  const result = await transportService.listOpenTransportOrders(req.query as never);
  res.status(200).json(result);
});

export const listMyAssignedJobsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const jobs = await transportService.listMyAssignedJobs(req.user.id);
  res.status(200).json(jobs);
});

export const listMyProposalsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const proposals = await transportService.listMyProposals(req.user.id);
  res.status(200).json(proposals);
});

export const getTransportOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.getTransportOrderForUser(req.params.id, req.user.id, req.user.role);
  res.status(200).json(transportOrder);
});

export const listProposalsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const proposals = await transportService.listProposals(req.params.id, req.user.id, req.user.role);
  res.status(200).json(proposals);
});

export const createProposalHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const proposal = await transportService.createProposal(req.user.id, req.user.role, req.params.id, req.body, req);
  res.status(201).json(proposal);
});

export const acceptProposalHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.acceptProposal(
    req.user.id,
    req.user.role,
    req.params.id,
    req.params.proposalId,
    req,
  );
  res.status(200).json(transportOrder);
});

export const transporterAcceptAssignmentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.transporterAcceptAssignment(req.user.id, req.params.id, req);
  res.status(200).json(transportOrder);
});

export const confirmPickupHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.confirmPickup(req.user.id, req.params.id, req.body.otp, req);
  res.status(200).json(transportOrder);
});

export const startTransitHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.startTransit(req.user.id, req.params.id, req);
  res.status(200).json(transportOrder);
});

export const confirmDeliveryHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.confirmDelivery(req.user.id, req.params.id, req.body.otp, req);
  res.status(200).json(transportOrder);
});

export const cancelTransportOrderHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const transportOrder = await transportService.cancelTransportOrder(req.user.id, req.user.role, req.params.id, req);
  res.status(200).json(transportOrder);
});
