import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { addTicketMessage, fetchTicket, updateTicketStatus } from '../services/supportService';
import { SUPPORT_TICKET_STATUS_LABELS, SupportTicket, SupportTicketStatus } from '../types/support';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const STAFF_ROLES = ['ADMIN', 'SUPPORT'];
const STATUS_OPTIONS: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'];

export function SupportTicketDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function reload() {
    if (!id) return;
    fetchTicket(id)
      .then(setTicket)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [id]);

  const isStaff = Boolean(user && STAFF_ROLES.includes(user.role));

  async function handleReply(event: FormEvent) {
    event.preventDefault();
    if (!id || !reply.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await addTicketMessage(id, reply.trim());
      setTicket(updated);
      setReply('');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a mensagem.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStatusChange(status: SupportTicketStatus) {
    if (!id) return;
    const updated = await updateTicketStatus(id, status);
    setTicket(updated);
  }

  if (isLoading) return <p className="text-neutral-500">A carregar...</p>;
  if (!ticket) return <p className="text-neutral-500">Ticket não encontrado.</p>;

  const isClosed = ticket.status === 'CLOSED';

  return (
    <div className="max-w-2xl space-y-6">
      <Link to="/suporte" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-xkwanza-600">
        <ArrowLeft size={14} />
        Voltar aos tickets
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{ticket.subject}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Aberto por {ticket.requester.name}
              {ticket.agent && ` · Atribuído a ${ticket.agent.name}`}
            </p>
          </div>
          <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-700">{ticket.description}</p>

        {isStaff && (
          <div className="mt-4 flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500">Estado:</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatusChange(e.target.value as SupportTicketStatus)}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-xkwanza-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {SUPPORT_TICKET_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Mensagens</p>

        {ticket.messages.length === 0 && <p className="text-sm text-neutral-500">Ainda sem respostas.</p>}

        <ul className="space-y-3">
          {ticket.messages.map((message) => (
            <li key={message.id} className="rounded-lg bg-neutral-50 p-3 text-sm">
              <p className="font-medium text-neutral-900">
                {message.author.name}
                {message.authorId === ticket.requester.id ? '' : ' · equipa XKWANZA'}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-neutral-700">{message.body}</p>
              <p className="mt-1 text-xs text-neutral-400">{new Date(message.createdAt).toLocaleString('pt-PT')}</p>
            </li>
          ))}
        </ul>

        {isClosed ? (
          <p className="text-sm text-neutral-500">Este ticket está fechado.</p>
        ) : (
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreve uma mensagem..."
              className={inputClass}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="shrink-0 rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
