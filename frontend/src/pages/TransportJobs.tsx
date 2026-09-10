import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { fetchOpenTransportOrders } from '../services/transportService';
import { TransportOrder } from '../types/logistics';
import { ANGOLA_PROVINCES, formatKwanza } from '../utils/angola';

export function TransportJobs() {
  const [province, setProvince] = useState('');
  const [jobs, setJobs] = useState<TransportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchOpenTransportOrders(province || undefined)
      .then((result) => setJobs(result.items))
      .finally(() => setIsLoading(false));
  }, [province]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Fretes disponíveis</h1>
        <p className="text-neutral-500">Pedidos de transporte abertos a propostas.</p>
      </div>

      <select
        value={province}
        onChange={(e) => setProvince(e.target.value)}
        className="rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
      >
        <option value="">Todas as províncias</option>
        {ANGOLA_PROVINCES.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && jobs.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Não há fretes disponíveis de momento.
        </p>
      )}

      {!isLoading && jobs.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {jobs.map((job) => (
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
                <p className="text-sm text-neutral-500">
                  {job.proposals.length} proposta(s) · {new Date(job.createdAt).toLocaleDateString('pt-AO')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-neutral-900">{formatKwanza(Number(job.order.total))}</span>
                <TransportStatusBadge status={job.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
