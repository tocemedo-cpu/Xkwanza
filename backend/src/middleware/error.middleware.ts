import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      details: err.flatten(),
    });
  }

  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error(err.message, { path: req.originalUrl, details: err.details });
    }
    return res.status(err.statusCode).json({ message: err.message, details: err.details });
  }

  const error = err as Error;
  logger.error('Erro não tratado', { message: error.message, stack: error.stack, path: req.originalUrl });
  return res.status(500).json({ message: 'Erro interno do servidor' });
}
