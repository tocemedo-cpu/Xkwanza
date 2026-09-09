import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authenticate } from '../../middleware/auth.middleware';
import { authRateLimiter } from '../../security/rateLimit';
import { loginSchema, refreshSchema, registerSchema } from './auth.schema';
import { loginHandler, logoutHandler, meHandler, refreshHandler, registerHandler } from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', authRateLimiter, validate(registerSchema), registerHandler);
authRouter.post('/login', authRateLimiter, validate(loginSchema), loginHandler);
authRouter.post('/refresh', validate(refreshSchema), refreshHandler);
authRouter.post('/logout', validate(refreshSchema), logoutHandler);
authRouter.get('/me', authenticate, meHandler);
