import { createHash } from 'crypto';

// Usado para guardar apenas o hash de refresh tokens na base de dados (nunca o token em claro).
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
