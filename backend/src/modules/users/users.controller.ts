import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as usersService from './users.service';

export const getMyProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await usersService.getProfile(req.user.id);
  res.status(200).json(profile);
});

export const updateMyProfileHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const profile = await usersService.updateProfile(req.user.id, req.body, req);
  res.status(200).json(profile);
});

export const listUsersHandler = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const result = await usersService.listUsers({ page, pageSize, role, search });
  res.status(200).json(result);
});

export const adminResetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const result = await usersService.adminResetPassword(req.params.id, req.user.id, req);
  res.status(200).json(result);
});

export const updateUserStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await usersService.updateUserStatus(req.params.id, req.user.id, req.body, req);
  res.status(200).json(user);
});

export const requestVerificationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await usersService.requestVerification(req.user.id, req);
  res.status(200).json(user);
});

export const listVerificationRequestsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.listVerificationRequests(req.query as never);
  res.status(200).json(result);
});

export const reviewVerificationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await usersService.reviewVerification(req.params.id, req.user.id, req.body, req);
  res.status(200).json(user);
});
