import { useEffect, useState } from 'react';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { fetchTransportOrdersForAdmin } from '../services/transportService';
import { TransportOrder } from '../types/logistics';
import { PaginatedResult } from '../types/marketplace';

export function AdminDeliveries() {
  const [result, setResult] = useState<PaginatedResult<TransportOrder> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransportOrdersForAdmin(1, 50)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Entregas</h1>
        <p className="text-neutral-500">Todos os fretes e entregas da plataforma.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhuma entrega registada.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((job) => (
            <div key={job.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">Frete #{job.id.slice(0, 8)}</p>
                <p className="text-neutral-500">
                  Pedido #{job.orderId.slice(0, 8)} · {job.transporter?.user?.name ?? 'Sem transportador atribuído'}
                </p>
              </div>
              <TransportStatusBadge status={job.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
