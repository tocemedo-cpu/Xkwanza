import { useEffect, useState } from 'react';
import { fetchPlatformReport } from '../services/economicsService';
import { PlatformReport } from '../types/economics';
import { ROLE_LABELS } from '../types/user';
import { formatKwanza } from '../utils/angola';

export function AdminReports() {
  const [report, setReport] = useState<PlatformReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformReport()
      .then(setReport)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Relatórios</h1>
        <p className="text-neutral-500">Indicadores agregados de toda a plataforma XKWANZA.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && report && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">Receita concluída (total)</p>
              <p className="text-2xl font-bold text-neutral-900">{formatKwanza(report.totalRevenue)}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">Pagamentos pendentes</p>
              <p className="text-2xl font-bold text-neutral-900">{report.pendingPayments}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">Produtos activos</p>
              <p className="text-2xl font-bold text-neutral-900">{report.activeProducts}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">Tickets de suporte abertos</p>
              <p className="text-2xl font-bold text-neutral-900">{report.openSupportTickets}</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-5">
              <p className="text-sm text-neutral-500">Negociações abertas</p>
              <p className="text-2xl font-bold text-neutral-900">{report.openQuoteRequests}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-4 py-3 font-semibold text-neutral-900">
              Utilizadores por perfil
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {Object.entries(report.usersByRole).map(([role, count]) => (
                  <tr key={role}>
                    <td className="px-4 py-2 text-neutral-600">{ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}</td>
                    <td className="px-4 py-2 text-right font-medium text-neutral-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
            <div className="border-b border-neutral-100 px-4 py-3 font-semibold text-neutral-900">
              Pedidos por estado
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-neutral-100">
                {Object.entries(report.ordersByStatus).map(([status, count]) => (
                  <tr key={status}>
                    <td className="px-4 py-2 text-neutral-600">{status}</td>
                    <td className="px-4 py-2 text-right font-medium text-neutral-900">{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
