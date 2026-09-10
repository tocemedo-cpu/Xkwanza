import { describe, expect, it, vi } from 'vitest';
import { Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { requireRole } from './rbac';
import { ApiError } from '../utils/apiError';

function mockReq(role?: UserRole): Request {
  return (role ? { user: { id: 'u1', role } } : {}) as Request;
}

describe('requireRole', () => {
  it('chama next() sem argumentos quando o utilizador tem um dos perfis permitidos', () => {
    const next = vi.fn();
    requireRole(UserRole.ADMIN, UserRole.SUPPORT)(mockReq(UserRole.ADMIN), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('chama next(ApiError 403) quando o utilizador tem um perfil não permitido', () => {
    const next = vi.fn();
    requireRole(UserRole.ADMIN)(mockReq(UserRole.BUYER), {} as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0] as ApiError;
    expect(err).toBeInstanceOf(ApiError);
    expect(err.statusCode).toBe(403);
  });

  it('chama next(ApiError 401) quando não há utilizador autenticado', () => {
    const next = vi.fn();
    requireRole(UserRole.ADMIN)(mockReq(), {} as Response, next);
    const err = next.mock.calls[0][0] as ApiError;
    expect(err.statusCode).toBe(401);
  });
});
