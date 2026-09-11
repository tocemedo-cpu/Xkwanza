import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as transporterRoutesService from './transporterRoutes.service';

export const createRouteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const route = await transporterRoutesService.createRoute(req.user.id, req.body, req);
  res.status(201).json(route);
});

export const listMyRoutesHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const routes = await transporterRoutesService.listMyRoutes(req.user.id);
  res.status(200).json(routes);
});

export const getRouteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const route = await transporterRoutesService.getRoute(req.user.id, req.params.id);
  res.status(200).json(route);
});

export const updateRouteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const route = await transporterRoutesService.updateRoute(req.user.id, req.params.id, req.body, req);
  res.status(200).json(route);
});

export const deleteRouteHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await transporterRoutesService.deleteRoute(req.user.id, req.params.id, req);
  res.status(204).send();
});

export const addStopHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const stop = await transporterRoutesService.addStop(req.user.id, req.params.id, req.body, req);
  res.status(201).json(stop);
});

export const updateStopHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const stop = await transporterRoutesService.updateStop(req.user.id, req.params.id, req.params.stopId, req.body, req);
  res.status(200).json(stop);
});

export const removeStopHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  await transporterRoutesService.removeStop(req.user.id, req.params.id, req.params.stopId, req);
  res.status(204).send();
});
