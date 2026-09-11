import { Router } from 'express';
import { UserRole } from '@prisma/client';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../security/rbac';
import { validate } from '../../middleware/validate.middleware';
import {
  addStopSchema,
  createRouteSchema,
  routeIdParamSchema,
  stopParamSchema,
  updateRouteSchema,
  updateStopSchema,
} from './transporterRoutes.schema';
import {
  addStopHandler,
  createRouteHandler,
  deleteRouteHandler,
  getRouteHandler,
  listMyRoutesHandler,
  removeStopHandler,
  updateRouteHandler,
  updateStopHandler,
} from './transporterRoutes.controller';

// Planeamento de rotas — organização manual de fretes aceites numa sequência de paragens.
// Sem provedor de mapas configurado: apenas sequenciamento/organização, não optimização de rota.
export const transporterRoutesRouter = Router();

transporterRoutesRouter.use(authenticate);
transporterRoutesRouter.use(requireRole(UserRole.TRANSPORTER));

transporterRoutesRouter.post('/', validate(createRouteSchema), createRouteHandler);
transporterRoutesRouter.get('/', listMyRoutesHandler);
transporterRoutesRouter.get('/:id', validate(routeIdParamSchema), getRouteHandler);
transporterRoutesRouter.patch('/:id', validate(updateRouteSchema), updateRouteHandler);
transporterRoutesRouter.delete('/:id', validate(routeIdParamSchema), deleteRouteHandler);

transporterRoutesRouter.post('/:id/stops', validate(addStopSchema), addStopHandler);
transporterRoutesRouter.patch('/:id/stops/:stopId', validate(updateStopSchema), updateStopHandler);
transporterRoutesRouter.delete('/:id/stops/:stopId', validate(stopParamSchema), removeStopHandler);
