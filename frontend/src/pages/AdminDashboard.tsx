import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, HandCoins, LifeBuoy } from 'lucide-react';
import { fetchPlatformReport } from '../services/economicsService';
import { PlatformReport } from '../types/economics';
import { ROLE_LABELS } from '../types/user';
import { formatKwanza } from '../utils/angola';

const QUICK_LINKS = [
  { to: '/admin/utilizadores', label: 'Utilizadores' },
  { to: '/admin/produtos', label: 'Produtos' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/negociacoes', label: 'Negociações' },
  { to: '/admin/reclamacoes', label: 'Reclamações' },
  { to: '/admin/relatorios', label: 'Relatório completo' },
];

export function AdminDashboard() {
  const [report, setReport] = useState<PlatformReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPlatformReport()
      .then(setReport)
      .finally(() => setIsLoading(false));
  }, []);

  const totalUsers = report ? Object.values(report.usersByRole).reduce((sum, n) => sum + (n ?? 0), 0) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Painel administrativo</h1>
        <p className="text-neutral-500">Visão geral da plataforma XKWANZA.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && report && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
              <Users size={18} />
              <span className="text-sm font-medium text-neutral-500">Utilizadores</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{totalUsers}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
              <Package size={18} />
              <span className="text-sm font-medium text-neutral-500">Produtos activos</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{report.activeProducts}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
              <HandCoins size={18} />
              <span className="text-sm font-medium text-neutral-500">Receita concluída</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{formatKwanza(report.totalRevenue)}</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
              <LifeBuoy size={18} />
              <span className="text-sm font-medium text-neutral-500">Tickets abertos</span>
            </div>
            <p className="text-2xl font-bold text-neutral-900">{report.openSupportTickets}</p>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
              <Users size={18} />
              <h2 className="font-semibold text-neutral-900">Utilizadores por perfil</h2>
            </div>
            <div className="space-y-1 text-sm">
              {Object.entries(report.usersByRole).map(([role, count]) => (
                <div key={role} className="flex justify-between">
                  <span className="text-neutral-600">{ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role}</span>
                  <span className="font-medium text-neutral-900">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5 sm:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
              <ShoppingBag size={18} />
              <h2 className="font-semibold text-neutral-900">Pedidos por estado</h2>
            </div>
            <div className="space-y-1 text-sm">
              {Object.entries(report.ordersByStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between">
                  <span className="text-neutral-600">{status}</span>
                  <span className="font-medium text-neutral-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-5">
        <h2 className="mb-3 font-semibold text-neutral-900">Acesso rápido</h2>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-xkwanza-600">
          {QUICK_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="hover:underline">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
