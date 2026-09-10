import { describe, expect, it } from 'vitest';
import { ApiError } from './apiError';

describe('ApiError', () => {
  it('badRequest produz statusCode 400 e mantém a mensagem/detalhes', () => {
    const err = ApiError.badRequest('Dados inválidos', { field: 'phone' });
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Dados inválidos');
    expect(err.details).toEqual({ field: 'phone' });
  });

  it('unauthorized/forbidden/notFound/conflict/internal produzem os códigos correctos', () => {
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict('Já existe').statusCode).toBe(409);
    expect(ApiError.internal().statusCode).toBe(500);
  });

  it('é uma instância de Error e mantém o prototype chain (instanceof funciona)', () => {
    const err = ApiError.forbidden('Sem permissão');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ApiError);
  });

  it('usa mensagens por omissão sensatas quando nenhuma é fornecida', () => {
    expect(ApiError.unauthorized().message).toBe('Não autenticado');
    expect(ApiError.forbidden().message).toBe('Acesso negado');
    expect(ApiError.notFound().message).toBe('Recurso não encontrado');
  });
});
