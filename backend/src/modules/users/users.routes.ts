import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import { updateProfileSchema } from './users.schema';
import { getMyProfileHandler, listUsersHandler, updateMyProfileHandler } from './users.controller';

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.get('/me', getMyProfileHandler);
usersRouter.patch('/me', validate(updateProfileSchema), updateMyProfileHandler);

// Apenas administração — RBAC garante que nenhum outro perfil acede à listagem de utilizadores.
usersRouter.get('/', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listUsersHandler);
