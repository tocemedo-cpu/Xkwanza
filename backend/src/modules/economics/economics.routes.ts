import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { getSellerStatsHandler, getTransporterStatsHandler } from './economics.controller';

export const economicsRouter = Router();

economicsRouter.use(authenticate);

economicsRouter.get('/seller', requireRole(UserRole.PRODUCER, UserRole.MERCHANT), getSellerStatsHandler);
economicsRouter.get('/transporter', requireRole(UserRole.TRANSPORTER), getTransporterStatsHandler);
