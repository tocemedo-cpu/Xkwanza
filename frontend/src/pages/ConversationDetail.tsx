import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { fetchConversation, sendMessage } from '../services/messagesService';
import { Conversation } from '../types/messages';

export function ConversationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    if (!id) return;
    fetchConversation(id).then(setConversation);
  }

  useEffect(reload, [id]);

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!id || !body.trim()) return;
    setError(null);
    setIsSending(true);
    try {
      await sendMessage(id, body.trim());
      setBody('');
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a mensagem.';
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  if (!conversation) return <p className="text-neutral-500">A carregar...</p>;

  const other =
    conversation.participantOneId === user?.id ? conversation.participantTwo : conversation.participantOne;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-xl font-bold text-neutral-900">{other.name}</h1>
      </div>

      <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto rounded-xl border border-neutral-200 bg-white p-4">
        {conversation.messages.length === 0 && (
          <p className="text-center text-sm text-neutral-500">Diga olá para começar a conversa.</p>
        )}
        {conversation.messages.map((message) => {
          const isOwn = message.authorId === user?.id;
          return (
            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm ${
                  isOwn ? 'bg-xkwanza-600 text-white' : 'bg-neutral-100 text-neutral-800'
                }`}
              >
                <p className="whitespace-pre-line">{message.body}</p>
                <p className={`mt-1 text-[10px] ${isOwn ? 'text-white/70' : 'text-neutral-400'}`}>
                  {new Date(message.createdAt).toLocaleString('pt-AO')}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        />
        <button
          type="submit"
          disabled={isSending || !body.trim()}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
