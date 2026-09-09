import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  consentIdParamSchema,
  createDocumentSchema,
  createSimulationSchema,
  documentIdParamSchema,
  grantConsentSchema,
  updateNissSchema,
} from './inss.schema';
import {
  createDocumentHandler,
  createSimulationHandler,
  getMyLinkageHandler,
  grantConsentHandler,
  listMyDocumentsHandler,
  listMySimulationsHandler,
  listPendingDocumentsHandler,
  rejectDocumentHandler,
  revokeConsentHandler,
  submitLinkageHandler,
  syncStatusHandler,
  updateNissHandler,
  verifyDocumentHandler,
} from './inss.controller';

export const inssRouter = Router();

inssRouter.use(authenticate);

inssRouter.get('/linkage/me', getMyLinkageHandler);
inssRouter.post('/consent', validate(grantConsentSchema), grantConsentHandler);
inssRouter.post('/consent/:consentId/revoke', validate(consentIdParamSchema), revokeConsentHandler);
inssRouter.patch('/linkage/me/niss', validate(updateNissSchema), updateNissHandler);
inssRouter.post('/linkage/me/submit', submitLinkageHandler);
inssRouter.post('/linkage/me/sync', syncStatusHandler);

inssRouter.post('/documents', validate(createDocumentSchema), createDocumentHandler);
inssRouter.get('/documents/mine', listMyDocumentsHandler);
inssRouter.get('/documents/pending', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listPendingDocumentsHandler);
inssRouter.post(
  '/documents/:id/verify',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(documentIdParamSchema),
  verifyDocumentHandler,
);
inssRouter.post(
  '/documents/:id/reject',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(documentIdParamSchema),
  rejectDocumentHandler,
);

inssRouter.post('/simulations', validate(createSimulationSchema), createSimulationHandler);
inssRouter.get('/simulations/mine', listMySimulationsHandler);
