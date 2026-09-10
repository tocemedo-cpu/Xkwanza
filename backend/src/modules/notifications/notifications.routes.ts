import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import {
  listMyNotificationsHandler,
  listNotificationsForAdminHandler,
  markAllNotificationsReadHandler,
  markNotificationReadHandler,
} from './notifications.controller';

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);

notificationsRouter.get('/mine', listMyNotificationsHandler);
notificationsRouter.patch('/read-all', markAllNotificationsReadHandler);
notificationsRouter.patch('/:id/read', markNotificationReadHandler);
notificationsRouter.get('/admin', requireRole(UserRole.ADMIN, UserRole.SUPPORT), listNotificationsForAdminHandler);
