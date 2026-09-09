import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { addressIdParamSchema, createAddressSchema, updateAddressSchema } from './addresses.schema';
import {
  createAddressHandler,
  deleteAddressHandler,
  listAddressesHandler,
  updateAddressHandler,
} from './addresses.controller';

export const addressesRouter = Router();

addressesRouter.use(authenticate);

addressesRouter.get('/', listAddressesHandler);
addressesRouter.post('/', validate(createAddressSchema), createAddressHandler);
addressesRouter.patch('/:id', validate(updateAddressSchema), updateAddressHandler);
addressesRouter.delete('/:id', validate(addressIdParamSchema), deleteAddressHandler);
