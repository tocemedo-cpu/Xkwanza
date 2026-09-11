import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  adminResetPasswordSchema,
  listVerificationRequestsQuerySchema,
  reviewVerificationSchema,
  updateProfileSchema,
  updateUserStatusSchema,
} from './users.schema';
import {
  adminResetPasswordHandler,
  getMyProfileHandler,
  listUsersHandler,
  listVerificationRequestsHandler,
  requestVerificationHandler,
  reviewVerificationHandler,
  updateMyProfileHandler,
  updateUserStatusHandler,
} from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/me', getMyProfileHandler);
usersRouter.patch('/me', validate(updateProfileSchema), updateMyProfileHandler);
usersRouter.post('/me/request-verification', requestVerificationHandler);

// Apenas administração — RBAC garante que nenhum outro perfil acede à listagem de utilizadores.
usersRouter.get('/', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listUsersHandler);
usersRouter.get(
  '/verification-requests',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(listVerificationRequestsQuerySchema),
  listVerificationRequestsHandler,
);
usersRouter.post(
  '/:id/reset-password',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(adminResetPasswordSchema),
  adminResetPasswordHandler,
);
usersRouter.patch(
  '/:id/status',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(updateUserStatusSchema),
  updateUserStatusHandler,
);
usersRouter.patch(
  '/:id/verification',
  requireRole(UserRole.ADMIN, UserRole.SUPPORT),
  validate(reviewVerificationSchema),
  reviewVerificationHandler,
);
