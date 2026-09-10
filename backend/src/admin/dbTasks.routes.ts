import { Router } from 'express';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { UserRole } from '@prisma/client';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { prisma } from '../database/prisma';

// Ferramenta interna de operações: marca migrações Prisma como já aplicadas
// numa base de dados cujo schema foi criado manualmente (ex: colado no SQL
// Editor do Supabase), e permite promover o primeiro administrador (que o
// registo público bloqueia de propósito). Protegida por segredo — sem ele,
// comporta-se como rota inexistente para não revelar a sua existência.
export const dbTasksRouter = Router();

const PROMOTABLE_ROLES: UserRole[] = [UserRole.ADMIN, UserRole.SUPPORT];

const BACKEND_ROOT = path.resolve(__dirname, '..', '..');
const BASELINE_MIGRATIONS = ['20260909194410_init', '20260909200500_formalization_stage_unique'];

dbTasksRouter.post('/db-baseline', (req, res) => {
  if (!env.adminTaskSecret || req.header('x-admin-secret') !== env.adminTaskSecret) {
    return res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
  }

  const results = BASELINE_MIGRATIONS.map((migration) => {
    try {
      const output = execFileSync('npx', ['prisma', 'migrate', 'resolve', '--applied', migration], {
        cwd: BACKEND_ROOT,
        encoding: 'utf-8',
        timeout: 30_000,
      });
      return { migration, status: 'ok' as const, output };
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; message: string };
      const combined = `${err.stdout ?? ''}${err.stderr ?? ''}`;
      const alreadyApplied = combined.includes('already recorded as applied');
      return {
        migration,
        status: alreadyApplied ? ('already-applied' as const) : ('error' as const),
        output: err.stdout ?? err.message,
        error: err.stderr,
      };
    }
  });

  const hasError = results.some((result) => result.status === 'error');
  logger.info('Tarefa db-baseline executada', { results });
  return res.status(hasError ? 500 : 200).json({ results });
});

dbTasksRouter.post('/promote-admin', async (req, res) => {
  if (!env.adminTaskSecret || req.header('x-admin-secret') !== env.adminTaskSecret) {
    return res.status(404).json({ message: `Rota não encontrada: ${req.method} ${req.originalUrl}` });
  }

  // Aceita "identifier" (telefone ou email); "phone" continua a funcionar por compatibilidade
  // com pedidos antigos, já que era o único campo antes de o login/registo passar a aceitar email.
  const identifierRaw = req.body?.identifier ?? req.body?.phone;
  const identifier = typeof identifierRaw === 'string' ? identifierRaw.trim().toLowerCase() : '';
  const role = typeof req.body?.role === 'string' ? req.body.role : UserRole.ADMIN;

  if (!identifier) {
    return res.status(400).json({ message: 'identifier é obrigatório (o telefone ou email com que a conta já está registada)' });
  }
  if (!PROMOTABLE_ROLES.includes(role as UserRole)) {
    return res.status(400).json({ message: `role deve ser um de: ${PROMOTABLE_ROLES.join(', ')}` });
  }

  const user = await prisma.user.findFirst({ where: { OR: [{ phone: identifier }, { email: identifier }] } });
  if (!user) {
    return res
      .status(404)
      .json({ message: `Nenhuma conta encontrada com o telefone/email ${identifier}. Regista-te primeiro na app.` });
  }

  const updated = await prisma.user.update({ where: { id: user.id }, data: { role: role as UserRole } });

  const contact = updated.phone ?? updated.email;
  logger.info('Utilizador promovido via promote-admin', { userId: updated.id, contact, role: updated.role });
  return res.status(200).json({
    message: `Conta ${contact} promovida a ${updated.role}.`,
    user: { id: updated.id, name: updated.name, phone: updated.phone, email: updated.email, role: updated.role },
  });
});
