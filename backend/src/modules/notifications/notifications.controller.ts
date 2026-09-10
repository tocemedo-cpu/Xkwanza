import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as notificationsService from './notifications.service';

export const listMyNotificationsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const notifications = await notificationsService.listMyNotifications(req.user.id);
  res.status(200).json(notifications);
});

export const markNotificationReadHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const notification = await notificationsService.markNotificationRead(req.user.id, req.params.id);
  res.status(200).json(notification);
});

export const markAllNotificationsReadHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await notificationsService.markAllNotificationsRead(req.user.id);
  res.status(204).send();
});

export const listNotificationsForAdminHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 50), 100);
  const result = await notificationsService.listNotificationsForAdmin(page, pageSize);
  res.status(200).json(result);
});
