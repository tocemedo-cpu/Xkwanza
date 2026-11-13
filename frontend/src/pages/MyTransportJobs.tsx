import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { fetchMyAssignedJobs } from '../services/transportService';
import { TransportOrder, TransportStatus } from '../types/logistics';
import { formatKwanza } from '../utils/angola';

const STATUS_FILTERS: Record<string, TransportStatus[]> = {
  solicitacoes: ['ASSIGNED'],
  aceites: ['ACCEPTED'],
  transito: ['PICKUP', 'PICKED_UP', 'IN_TRANSIT'],
  concluidas: ['DELIVERED'],
};

const TAB_LABELS: { value: string; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'solicitacoes', label: 'Solicitações' },
  { value: 'aceites', label: 'Serviços aceites' },
  { value: 'transito', label: 'Em trânsito' },
  { value: 'concluidas', label: 'Entregas concluídas' },
];

export function MyTransportJobs() {
  const [jobs, setJobs] = useState<TransportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? 'todos';

  useEffect(() => {
    fetchMyAssignedJobs()
      .then(setJobs)
      .finally(() => setIsLoading(false));
  }, []);

  const visibleJobs = useMemo(() => {
    const allowed = STATUS_FILTERS[status];
    return allowed ? jobs.filter((j) => allowed.includes(j.status)) : jobs;
  }, [jobs, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meus fretes</h1>
        <p className="text-neutral-500">Transportes que lhe foram atribuídos.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TAB_LABELS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSearchParams(tab.value === 'todos' ? {} : { status: tab.value })}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              status === tab.value
                ? 'border-xkwanza-950 bg-xkwanza-950 text-white'
                : 'border-neutral-200 text-neutral-700 hover:border-xkwanza-600 hover:text-xkwanza-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && visibleJobs.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          {jobs.length === 0 ? (
            <>
              Ainda não tem fretes atribuídos.{' '}
              <Link to="/transportador/fretes" className="font-medium text-xkwanza-600 hover:underline">
                Ver fretes disponíveis
              </Link>
            </>
          ) : (
            'Nenhum frete nesta vista.'
          )}
        </p>
      )}

      {!isLoading && visibleJobs.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {visibleJobs.map((job) => (
            <Link
              key={job.id}
              to={`/transportador/fretes/${job.id}`}
              className="flex items-center justify-between p-4 hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">
                  {job.order.items.length} item(ns) · {job.order.shippingAddress.municipality},{' '}
                  {job.order.shippingAddress.province}
                </p>
                <p className="text-sm text-neutral-500">{new Date(job.createdAt).toLocaleDateString('pt-AO')}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-neutral-900">
                  {formatKwanza(Number(job.agreedPrice ?? job.order.total))}
                </span>
                <TransportStatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
