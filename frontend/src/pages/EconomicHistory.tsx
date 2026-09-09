import { useEffect, useState } from 'react';
import { TrendingUp, Star, Package, ShoppingBag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchSellerStats, fetchTransporterStats } from '../services/economicsService';
import { SellerStats, TransporterStats } from '../types/reviews';
import { formatKwanza } from '../utils/angola';

function MonthlyChart({ data, valueLabel }: { data: { month: string; value: number }[]; valueLabel: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 pt-4" style={{ height: 140 }}>
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
          <div
            className="w-full rounded-t bg-xkwanza-500"
            style={{ height: `${Math.max((d.value / max) * 100, 2)}px` }}
            title={`${d.month}: ${formatKwanza(d.value)}`}
          />
          <span className="text-[10px] text-neutral-500">{d.month.slice(5)}</span>
        </div>
      ))}
      <span className="sr-only">{valueLabel}</span>
    </div>
  );
}

export function EconomicHistory() {
  const { user } = useAuth();
  const [sellerStats, setSellerStats] = useState<SellerStats | null>(null);
  const [transporterStats, setTransporterStats] = useState<TransporterStats | null>(null);

  const isTransporter = user?.role === 'TRANSPORTER';

  useEffect(() => {
    if (isTransporter) {
      fetchTransporterStats().then(setTransporterStats);
    } else {
      fetchSellerStats().then(setSellerStats);
    }
  }, [isTransporter]);

  if (isTransporter) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Meu histórico económico</h1>
          <p className="text-neutral-500">Rendimento e reputação como transportador XKWANZA.</p>
        </div>

        {transporterStats && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                  <TrendingUp size={18} />
                  <h2 className="font-semibold text-neutral-900">Rendimento total</h2>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{formatKwanza(transporterStats.totalEarnings)}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                  <Package size={18} />
                  <h2 className="font-semibold text-neutral-900">Entregas concluídas</h2>
                </div>
                <p className="text-2xl font-bold text-neutral-900">{transporterStats.totalDeliveries}</p>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white p-5">
                <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                  <Star size={18} />
                  <h2 className="font-semibold text-neutral-900">Reputação</h2>
                </div>
                <p className="text-2xl font-bold text-neutral-900">
                  {transporterStats.averageRating ? transporterStats.averageRating.toFixed(1) : '—'}
                  <span className="ml-1 text-sm font-normal text-neutral-500">
                    ({transporterStats.ratingCount} avaliações)
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="mb-2 font-semibold text-neutral-900">Rendimento mensal (últimos 6 meses)</h2>
              <MonthlyChart
                data={transporterStats.monthlyEarnings.map((m) => ({ month: m.month, value: m.earnings }))}
                valueLabel="Rendimento"
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu histórico económico</h1>
        <p className="text-neutral-500">Vendas, rendimento e reputação no marketplace XKWANZA.</p>
      </div>

      {sellerStats && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                <TrendingUp size={18} />
                <h2 className="font-semibold text-neutral-900">Rendimento total</h2>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{formatKwanza(sellerStats.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                <ShoppingBag size={18} />
                <h2 className="font-semibold text-neutral-900">Pedidos concluídos</h2>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{sellerStats.totalOrders}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                <Package size={18} />
                <h2 className="font-semibold text-neutral-900">Itens vendidos</h2>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{sellerStats.totalItemsSold}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
                <Star size={18} />
                <h2 className="font-semibold text-neutral-900">Reputação</h2>
              </div>
              <p className="text-2xl font-bold text-neutral-900">
                {sellerStats.averageRating ? sellerStats.averageRating.toFixed(1) : '—'}
                <span className="ml-1 text-sm font-normal text-neutral-500">({sellerStats.ratingCount})</span>
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h2 className="mb-2 font-semibold text-neutral-900">Rendimento mensal (últimos 6 meses)</h2>
            <MonthlyChart
              data={sellerStats.monthlyRevenue.map((m) => ({ month: m.month, value: m.revenue }))}
              valueLabel="Rendimento"
            />
          </div>
        </>
      )}
    </div>
  );
}
