import { apiClient } from '../api/client';
import { Conversation, ConversationMessage } from '../types/messages';

export async function startConversation(params: {
  otherUserId: string;
  contextOrderId?: string;
  contextProductId?: string;
}): Promise<Conversation> {
  const { data } = await apiClient.post<Conversation>('/messages/start', params);
  return data;
}

export async function fetchMyConversations(): Promise<Conversation[]> {
  const { data } = await apiClient.get<Conversation[]>('/messages/mine');
  return data;
}

export async function fetchConversation(id: string): Promise<Conversation> {
  const { data } = await apiClient.get<Conversation>(`/messages/${id}`);
  return data;
}

export async function sendMessage(conversationId: string, body: string): Promise<ConversationMessage> {
  const { data } = await apiClient.post<ConversationMessage>(`/messages/${conversationId}/messages`, { body });
  return data;
}
