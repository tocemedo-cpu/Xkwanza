import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { conversationIdParamSchema, sendMessageSchema, startConversationSchema } from './messages.schema';
import {
  getConversationHandler,
  listMyConversationsHandler,
  sendMessageHandler,
  startConversationHandler,
} from './messages.controller';

export const messagesRouter = Router();

// Mensagens directas entre dois utilizadores — todas as rotas exigem sessão, e o acesso a uma
// conversa concreta é sempre restrito aos seus dois participantes (verificado no serviço).
messagesRouter.use(authenticate);

messagesRouter.post('/start', validate(startConversationSchema), startConversationHandler);
messagesRouter.get('/mine', listMyConversationsHandler);
messagesRouter.get('/:id', validate(conversationIdParamSchema), getConversationHandler);
messagesRouter.post('/:id/messages', validate(sendMessageSchema), sendMessageHandler);
