import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { adminResetPasswordSchema, updateProfileSchema, updateUserStatusSchema } from './users.schema';
import {
  adminResetPasswordHandler,
  getMyProfileHandler,
  listUsersHandler,
  updateMyProfileHandler,
  updateUserStatusHandler,
} from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/me', getMyProfileHandler);
usersRouter.patch('/me', validate(updateProfileSchema), updateMyProfileHandler);

// Apenas administração — RBAC garante que nenhum outro perfil acede à listagem de utilizadores.
usersRouter.get('/', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listUsersHandler);
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
