import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/apiError';
import * as messagesService from './messages.service';

export const startConversationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const conversation = await messagesService.startOrGetConversation(req.user.id, req.body);
  res.status(200).json(conversation);
});

export const listMyConversationsHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const conversations = await messagesService.listMyConversations(req.user.id);
  res.status(200).json(conversations);
});

export const getConversationHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const conversation = await messagesService.getConversationForUser(req.params.id, req.user.id);
  res.status(200).json(conversation);
});

export const sendMessageHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  const message = await messagesService.sendMessage(req.params.id, req.user.id, req.body.body);
  res.status(201).json(message);
});
