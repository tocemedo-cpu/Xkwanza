import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchComplaints } from '../services/complaintsService';
import { COMPLAINT_STATUS_LABELS, Complaint, ComplaintStatus } from '../types/complaints';

const STATUS_OPTIONS: ComplaintStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

const STATUS_BADGE_CLASSES: Record<ComplaintStatus, string> = {
  OPEN: 'bg-gold-100 text-gold-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-xkwanza-100 text-xkwanza-600',
  REJECTED: 'bg-red-100 text-red-700',
};

export function AdminDisputas() {
  const [status, setStatus] = useState<ComplaintStatus | ''>('');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 20;

  function reload() {
    setIsLoading(true);
    fetchComplaints(status || undefined, page, pageSize)
      .then((result) => {
        setComplaints(result.items);
        setTotal(result.total);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [status, page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Disputas</h1>
        <p className="text-neutral-500">Disputas abertas por todos os utilizadores da plataforma.</p>
      </div>

      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value as ComplaintStatus | '');
          setPage(1);
        }}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
      >
        <option value="">Todos os estados</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {COMPLAINT_STATUS_LABELS[s]}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && complaints.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Sem disputas para este filtro.
        </p>
      )}

      {!isLoading && complaints.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {complaints.map((complaint) => (
            <Link
              key={complaint.id}
              to={complaint.id}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{complaint.subject}</p>
                <p className="text-neutral-500">
                  {complaint.complainant.name}
                  {complaint.agent && ` · atribuída a ${complaint.agent.name}`}
                  {' · '}
                  actualizado em {new Date(complaint.updatedAt).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[complaint.status]}`}
              >
                {COMPLAINT_STATUS_LABELS[complaint.status]}
              </span>
            </Link>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-neutral-500">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-neutral-300 px-3 py-1.5 disabled:opacity-50"
          >
            Seguinte
          </button>
        </div>
      )}
    </div>
  );
}
