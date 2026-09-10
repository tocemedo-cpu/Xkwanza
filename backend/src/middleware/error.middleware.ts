import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';

const UNIQUE_FIELD_LABELS: Record<string, string> = {
  phone: 'telefone',
  email: 'email',
  nif: 'NIF',
};

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

  if (err instanceof MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Imagem demasiado grande — o limite é 5MB' : err.message;
    return res.status(400).json({ message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const fields = (err.meta?.target as string[] | undefined) ?? [];
    const label = fields.map((f) => UNIQUE_FIELD_LABELS[f] ?? f).join('/') || 'valor';
    return res.status(409).json({ message: `Já existe uma conta com este ${label}` });
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
