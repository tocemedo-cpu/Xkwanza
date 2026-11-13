import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchMyConversations } from '../services/messagesService';
import { Conversation } from '../types/messages';
import { getRolePrefix } from '../types/user';

export function Mensagens() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'comprador';
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyConversations()
      .then(setConversations)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Mensagens</h1>
        <p className="text-neutral-500">Conversas sobre produtos, pedidos e entregas.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && conversations.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não tem nenhuma conversa. Pode iniciar uma a partir de um produto ou de um pedido.
        </p>
      )}

      {!isLoading && conversations.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {conversations.map((conversation) => {
            const other =
              conversation.participantOneId === user?.id ? conversation.participantTwo : conversation.participantOne;
            const lastMessage = conversation.messages[0];
            return (
              <Link
                key={conversation.id}
                to={`/${prefix}/mensagens/${conversation.id}`}
                className="flex items-center justify-between gap-4 p-4 hover:bg-neutral-50"
              >
                <div className="min-w-0">
                  <p className="font-medium text-neutral-900">{other.name}</p>
                  {lastMessage && <p className="truncate text-sm text-neutral-500">{lastMessage.body}</p>}
                </div>
                <span className="shrink-0 text-xs text-neutral-400">
                  {new Date(conversation.updatedAt).toLocaleDateString('pt-AO')}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
