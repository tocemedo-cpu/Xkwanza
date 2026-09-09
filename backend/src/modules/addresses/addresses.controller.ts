import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as addressesService from './addresses.service';

export const listAddressesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const addresses = await addressesService.listAddresses(req.user.id);
  res.status(200).json(addresses);
});

export const createAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const address = await addressesService.createAddress(req.user.id, req.body);
  res.status(201).json(address);
});

export const updateAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const address = await addressesService.updateAddress(req.user.id, req.params.id, req.body);
  res.status(200).json(address);
});

export const deleteAddressHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await addressesService.deleteAddress(req.user.id, req.params.id);
  res.status(204).send();
});
