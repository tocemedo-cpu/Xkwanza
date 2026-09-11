import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as authService from './auth.service';
import { ApiError } from '../../utils/apiError';
import { prisma } from '../../database/prisma';

export const registerHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.register(req.body, req);
  res.status(201).json(result);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body, req);
  res.status(200).json(result);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refresh(req.body.refreshToken, req);
  res.status(200).json(result);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.body.refreshToken);
  res.status(204).send();
});

export const requestPasswordResetHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.requestPasswordReset(req.body.identifier, req);
  res.status(200).json(result);
});

export const resetPasswordHandler = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.body.token, req.body.password, req);
  res.status(204).send();
});

export const meHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) throw ApiError.notFound('Utilizador não encontrado');
  res.status(200).json(authService.toPublicUser(user));
});
