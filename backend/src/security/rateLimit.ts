import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

// Limite geral da API — protecção contra abuso e DoS básico.
export const apiRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  max: env.security.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados pedidos. Tente novamente mais tarde.' },
});

// Limite mais restrito para login/registo — protecção contra brute force.
export const authRateLimiter = rateLimit({
  windowMs: env.security.rateLimitWindowMs,
  max: env.security.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Demasiadas tentativas. Tente novamente mais tarde.' },
});
