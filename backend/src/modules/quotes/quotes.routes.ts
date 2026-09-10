import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  createProposalSchema,
  createQuoteRequestSchema,
  listQuotesForAdminQuerySchema,
  proposalIdParamSchema,
  quoteIdParamSchema,
} from './quotes.schema';
import {
  acceptProposalHandler,
  cancelQuoteRequestHandler,
  createProposalHandler,
  createQuoteRequestHandler,
  getQuoteRequestHandler,
  listMyQuoteRequestsHandler,
  listOpenQuotesForSellerHandler,
  listQuotesForAdminHandler,
} from './quotes.controller';

export const quotesRouter = Router();

quotesRouter.use(authenticate);

quotesRouter.post('/', validate(createQuoteRequestSchema), createQuoteRequestHandler);
quotesRouter.get('/mine', listMyQuoteRequestsHandler);
quotesRouter.get('/', listOpenQuotesForSellerHandler);
quotesRouter.get(
  '/admin',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(listQuotesForAdminQuerySchema),
  listQuotesForAdminHandler,
);
quotesRouter.get('/:id', validate(quoteIdParamSchema), getQuoteRequestHandler);
quotesRouter.post('/:id/proposals', validate(createProposalSchema), createProposalHandler);
quotesRouter.post('/:id/proposals/:proposalId/accept', validate(proposalIdParamSchema), acceptProposalHandler);
quotesRouter.patch('/:id/cancel', validate(quoteIdParamSchema), cancelQuoteRequestHandler);
