import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as inssService from './inss.service';

export const getMyLinkageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.getMyLinkage(req.user.id);
  res.status(200).json(linkage);
});

export const grantConsentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.grantConsent(req.user.id, req.body, req);
  res.status(200).json(linkage);
});

export const revokeConsentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.revokeConsent(req.user.id, req.params.consentId, req);
  res.status(200).json(linkage);
});

export const updateNissHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.updateNiss(req.user.id, req.body.niss, req);
  res.status(200).json(linkage);
});

export const submitLinkageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.submitLinkage(req.user.id, req);
  res.status(200).json(linkage);
});

export const syncStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const linkage = await inssService.syncStatus(req.user.id, req);
  res.status(200).json(linkage);
});

export const createDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await inssService.createDocument(req.user.id, req.body);
  res.status(201).json(document);
});

export const listMyDocumentsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const documents = await inssService.listMyDocuments(req.user.id);
  res.status(200).json(documents);
});

export const listPendingDocumentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const documents = await inssService.listPendingDocuments();
  res.status(200).json(documents);
});

export const verifyDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await inssService.verifyDocument(req.user.id, req.params.id, req);
  res.status(200).json(document);
});

export const rejectDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await inssService.rejectDocument(req.user.id, req.params.id, req);
  res.status(200).json(document);
});

export const createSimulationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const simulation = await inssService.createSimulation(req.user.id, req.body, req);
  res.status(201).json(simulation);
});

export const listMySimulationsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const simulations = await inssService.listMySimulations(req.user.id);
  res.status(200).json(simulations);
});
