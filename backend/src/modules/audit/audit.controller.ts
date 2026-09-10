import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import * as auditService from './audit.service';

export const listAuditLogsHandler = asyncHandler(async (req: Request, res: Response) => {
  const result = await auditService.listAuditLogs(req.query as never);
  res.status(200).json(result);
});
