import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchTickets } from '../services/supportService';
import { SUPPORT_TICKET_STATUS_LABELS, SupportTicket, SupportTicketStatus } from '../types/support';

const STATUS_OPTIONS: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'WAITING_ON_USER', 'RESOLVED', 'CLOSED'];

export function AdminSupport() {
  const [status, setStatus] = useState<SupportTicketStatus | ''>('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function reload() {
    setIsLoading(true);
    fetchTickets(status || undefined)
      .then((result) => setTickets(result.items))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Suporte e reclamações</h1>
        <p className="text-neutral-500">Tickets de todos os utilizadores da plataforma.</p>
      </div>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as SupportTicketStatus | '')}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
      >
        <option value="">Todos os estados</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {SUPPORT_TICKET_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && tickets.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Sem tickets para este filtro.
        </p>
      )}

      {!isLoading && tickets.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/admin/reclamacoes/${ticket.id}`}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{ticket.subject}</p>
                <p className="text-neutral-500">
                  {ticket.requester.name} ({ticket.requester.phone ?? ticket.requester.email ?? '—'})
                  {ticket.agent && ` · atribuído a ${ticket.agent.name}`}
                </p>
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
