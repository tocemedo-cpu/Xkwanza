import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as formalizationService from './formalization.service';

export const submitDiagnosisHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const dossier = await formalizationService.submitDiagnosis(req.user.id, req.body, req);
  res.status(200).json(dossier);
});

export const getMyDossierHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const dossier = await formalizationService.getMyDossier(req.user.id);
  res.status(200).json(dossier);
});

export const updateDossierHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const dossier = await formalizationService.updateDossier(req.user.id, req.body, req);
  res.status(200).json(dossier);
});

export const completeStageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const dossier = await formalizationService.completeStage(req.user.id, Number(req.params.stageNumber), req);
  res.status(200).json(dossier);
});

export const finalizeDossierHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const dossier = await formalizationService.finalizeDossier(req.user.id, req.params.userId, req);
  res.status(200).json(dossier);
});

export const listDossiersReadyToFinalizeHandler = asyncHandler(async (_req: Request, res: Response) => {
  const dossiers = await formalizationService.listDossiersReadyToFinalize();
  res.status(200).json(dossiers);
});

export const createDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await formalizationService.createDocument(req.user.id, req.body);
  res.status(201).json(document);
});

export const listMyDocumentsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const documents = await formalizationService.listMyDocuments(req.user.id);
  res.status(200).json(documents);
});

export const listPendingDocumentsHandler = asyncHandler(async (_req: Request, res: Response) => {
  const documents = await formalizationService.listPendingDocuments();
  res.status(200).json(documents);
});

export const verifyDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await formalizationService.verifyDocument(req.user.id, req.params.id, req);
  res.status(200).json(document);
});

export const rejectDocumentHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const document = await formalizationService.rejectDocument(req.user.id, req.params.id, req);
  res.status(200).json(document);
});
