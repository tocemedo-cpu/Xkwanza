import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { fetchMyAssignedJobs } from '../services/transportService';
import { TransportOrder } from '../types/logistics';
import { formatKwanza } from '../utils/angola';

export function MyTransportJobs() {
  const [jobs, setJobs] = useState<TransportOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyAssignedJobs()
      .then(setJobs)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meus fretes</h1>
        <p className="text-neutral-500">Transportes que lhe foram atribuídos.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && jobs.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não tem fretes atribuídos.{' '}
          <Link to="/transportador/fretes" className="font-medium text-xkwanza-600 hover:underline">
            Ver fretes disponíveis
          </Link>
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
