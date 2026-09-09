import { createApp } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './database/prisma';

const app = createApp();

const server = app.listen(env.port, () => {
  logger.info(`XKWANZA backend a correr na porta ${env.port}`, { env: env.nodeEnv });
});

async function shutdown(signal: string) {
  logger.info(`A encerrar servidor (${signal})...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
