import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env';
import { apiRateLimiter } from './security/rateLimit';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { categoriesRouter } from './modules/categories/categories.routes';
import { addressesRouter } from './modules/addresses/addresses.routes';
import { productsRouter } from './modules/products/products.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { transportersRouter } from './modules/transporters/transporters.routes';
import { transportRouter } from './modules/transport/transport.routes';
import { paymentsRouter } from './modules/payments/payments.routes';
import { walletRouter } from './modules/wallet/wallet.routes';
import { bankAccountsRouter } from './modules/bankAccounts/bankAccounts.routes';
import { reviewsRouter } from './modules/reviews/reviews.routes';
import { economicsRouter } from './modules/economics/economics.routes';
import { formalizationRouter } from './modules/formalization/formalization.routes';
import { inssRouter } from './modules/inss/inss.routes';
import { dbTasksRouter } from './admin/dbTasks.routes';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  // Segurança de base: cabeçalhos HTTP seguros, CORS restrito, protecção contra HTTP Parameter Pollution.
  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(hpp());
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
  app.use(apiRateLimiter);

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'xkwanza-backend', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/transporters', transportersRouter);
  app.use('/api/transport-orders', transportRouter);
  app.use('/api/payments', paymentsRouter);
  app.use('/api/wallet', walletRouter);
  app.use('/api/bank-accounts', bankAccountsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/economics', economicsRouter);
  app.use('/api/formalization', formalizationRouter);
  app.use('/api/inss', inssRouter);
  app.use('/internal/tasks', dbTasksRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
