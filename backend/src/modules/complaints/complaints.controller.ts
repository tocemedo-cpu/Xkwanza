import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as complaintsService from './complaints.service';

export const createComplaintHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const complaint = await complaintsService.createComplaint(req.user.id, req.body, req);
  res.status(201).json(complaint);
});

export const listMyComplaintsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const complaints = await complaintsService.listMyComplaints(req.user.id);
  res.status(200).json(complaints);
});

export const listComplaintsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await complaintsService.listComplaints(req.query as never);
  res.status(200).json(result);
});

export const getComplaintHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const complaint = await complaintsService.getComplaint(req.params.id, req.user.id, req.user.role);
  res.status(200).json(complaint);
});

export const addComplaintMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const complaint = await complaintsService.addComplaintMessage(req.params.id, req.user.id, req.user.role, req.body, req);
  res.status(200).json(complaint);
});

export const updateComplaintStatusHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const complaint = await complaintsService.updateComplaintStatus(req.params.id, req.user.id, req.body, req);
  res.status(200).json(complaint);
});
