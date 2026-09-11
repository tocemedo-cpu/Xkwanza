import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../security/rateLimit';
import { loginSchema, refreshSchema, registerSchema, requestPasswordResetSchema, resetPasswordSchema } from './auth.schema';
import {
  loginHandler,
  logoutHandler,
  meHandler,
  refreshHandler,
  registerHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
} from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), registerHandler);
authRouter.post('/login', authRateLimiter, validate(loginSchema), loginHandler);
authRouter.post('/refresh', validate(refreshSchema), refreshHandler);
authRouter.post('/logout', validate(refreshSchema), logoutHandler);
authRouter.post(
  '/request-password-reset',
  authRateLimiter,
  validate(requestPasswordResetSchema),
  requestPasswordResetHandler,
);
authRouter.post('/reset-password', authRateLimiter, validate(resetPasswordSchema), resetPasswordHandler);
authRouter.get('/me', authenticate, meHandler);
