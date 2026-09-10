import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password';

describe('password hashing (argon2)', () => {
  it('produz um hash diferente do texto simples, e verifica correctamente a password certa', async () => {
    const hash = await hashPassword('Password123!');
    expect(hash).not.toBe('Password123!');
    expect(hash.startsWith('$argon2id$')).toBe(true);

    const ok = await verifyPassword(hash, 'Password123!');
    expect(ok).toBe(true);
  });

  it('rejeita uma password errada', async () => {
    const hash = await hashPassword('Password123!');
    const ok = await verifyPassword(hash, 'PasswordErrada!');
    expect(ok).toBe(false);
  });

  it('duas hashes da mesma password são diferentes entre si (salt aleatório)', async () => {
    const hash1 = await hashPassword('Password123!');
    const hash2 = await hashPassword('Password123!');
    expect(hash1).not.toBe(hash2);
  });

  it('verifyPassword nunca rebenta com um hash inválido/corrompido — devolve false', async () => {
    const ok = await verifyPassword('isto-nao-e-um-hash-argon2', 'qualquer-coisa');
    expect(ok).toBe(false);
  });
});
