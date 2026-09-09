import { useEffect, useState } from 'react';
import { confirmPayment, fetchPendingPayments, rejectPayment } from '../services/paymentsService';
import { PAYMENT_METHOD_LABELS, PAYMENT_STATUS_LABELS, PendingPaymentOrder } from '../types/payments';
import { formatKwanza } from '../utils/angola';

export function AdminPayments() {
  const [orders, setOrders] = useState<PendingPaymentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchPendingPayments()
      .then((result) => setOrders(result.items))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleConfirm(orderId: string) {
    setError(null);
    try {
      await confirmPayment(orderId);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível confirmar.';
      setError(message);
    }
  }

  async function handleReject(orderId: string) {
    setError(null);
    try {
      await rejectPayment(orderId);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível rejeitar.';
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Pagamentos pendentes</h1>
        <p className="text-neutral-500">
          Confirme manualmente os depósitos por transferência bancária/referência depois de verificar o extracto
          real — não existe integração bancária automática.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && orders.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Sem pagamentos pendentes de confirmação.
        </p>
      )}

      {!isLoading && orders.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  Pedido #{order.id.slice(0, 8)} · {order.buyer.name} ({order.buyer.phone})
                </p>
                <p className="text-neutral-500">
                  {PAYMENT_METHOD_LABELS[order.payment.method]} · {PAYMENT_STATUS_LABELS[order.payment.status]}
                  {order.payment.externalRef && ` · Ref: ${order.payment.externalRef}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-900">{formatKwanza(Number(order.payment.amount))}</span>
                <button
                  onClick={() => handleConfirm(order.id)}
                  className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleReject(order.id)}
                  className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
