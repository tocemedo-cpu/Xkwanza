export interface ConversationParticipant {
  id: string;
  name: string;
  avatarUrl: string | null;
  role: string;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  authorId: string;
  body: string;
  createdAt: string;
  author?: ConversationParticipant;
}

export interface Conversation {
  id: string;
  participantOneId: string;
  participantTwoId: string;
  contextOrderId: string | null;
  contextProductId: string | null;
  createdAt: string;
  updatedAt: string;
  participantOne: ConversationParticipant;
  participantTwo: ConversationParticipant;
  messages: ConversationMessage[];
}
