import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createTicket, fetchMyTickets } from '../services/supportService';
import { SUPPORT_TICKET_STATUS_LABELS, SupportTicket } from '../types/support';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function Support() {
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'comprador';
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchMyTickets()
      .then(setTickets)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createTicket({ subject, description });
      setSubject('');
      setDescription('');
      setShowForm(false);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar o ticket.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Suporte</h1>
          <p className="text-neutral-500">Os teus pedidos de apoio e reclamações.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700"
        >
          {showForm ? 'Cancelar' : 'Novo ticket'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Assunto</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreve o problema ou a reclamação com o máximo de detalhe possível."
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A enviar...' : 'Enviar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && tickets.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não abriste nenhum ticket.
        </p>
      )}

      {!isLoading && tickets.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/${prefix}/suporte/${ticket.id}`}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{ticket.subject}</p>
                <p className="text-neutral-500">Actualizado em {new Date(ticket.updatedAt).toLocaleDateString('pt-PT')}</p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
