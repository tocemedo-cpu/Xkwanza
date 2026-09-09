import { NextFunction, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { ApiError } from '../utils/apiError';

// RBAC — restringe rotas a um conjunto de personas. Deve ser usado depois do middleware de autenticação.
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('O seu perfil não tem permissão para esta acção'));
    }
    next();
  };
}
