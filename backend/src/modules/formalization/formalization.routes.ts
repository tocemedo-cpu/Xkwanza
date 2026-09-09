import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  completeStageParamSchema,
  createDocumentSchema,
  documentIdParamSchema,
  finalizeDossierParamSchema,
  submitDiagnosisSchema,
  updateDossierSchema,
} from './formalization.schema';
import {
  completeStageHandler,
  createDocumentHandler,
  finalizeDossierHandler,
  getMyDossierHandler,
  listDossiersReadyToFinalizeHandler,
  listMyDocumentsHandler,
  listPendingDocumentsHandler,
  rejectDocumentHandler,
  submitDiagnosisHandler,
  updateDossierHandler,
  verifyDocumentHandler,
} from './formalization.controller';

export const formalizationRouter = Router();

formalizationRouter.use(authenticate);

formalizationRouter.post('/diagnosis', validate(submitDiagnosisSchema), submitDiagnosisHandler);
formalizationRouter.get('/dossier/me', getMyDossierHandler);
formalizationRouter.patch('/dossier/me', validate(updateDossierSchema), updateDossierHandler);
formalizationRouter.post('/stages/:stageNumber/complete', validate(completeStageParamSchema), completeStageHandler);
formalizationRouter.post(
  '/dossier/:userId/finalize',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(finalizeDossierParamSchema),
  finalizeDossierHandler,
);

formalizationRouter.get(
  '/dossiers/ready-to-finalize',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  listDossiersReadyToFinalizeHandler,
);

formalizationRouter.post('/documents', validate(createDocumentSchema), createDocumentHandler);
formalizationRouter.get('/documents/mine', listMyDocumentsHandler);
formalizationRouter.get(
  '/documents/pending',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  listPendingDocumentsHandler,
);
formalizationRouter.post(
  '/documents/:id/verify',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(documentIdParamSchema),
  verifyDocumentHandler,
);
formalizationRouter.post(
  '/documents/:id/reject',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(documentIdParamSchema),
  rejectDocumentHandler,
);
