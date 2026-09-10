import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { listAuditLogsQuerySchema } from './audit.schema';
import { listAuditLogsHandler } from './audit.controller';

export const auditRouter = Router();

auditRouter.use(authenticate, requireRole(UserRole.ADMIN, UserRole.SUPPORT));

auditRouter.get('/', validate(listAuditLogsQuerySchema), listAuditLogsHandler);
