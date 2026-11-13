import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CheckCircle2, Truck, PackageCheck, Clock, HandCoins } from 'lucide-react';
import { fetchMyAssignedJobs } from '../services/transportService';
import { fetchTransporterStats } from '../services/economicsService';
import { TransportOrder } from '../types/logistics';
import { TransporterStats } from '../types/reviews';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { formatKwanza } from '../utils/angola';

const ACCEPTED_STATUSES = ['ACCEPTED'];
const IN_PROGRESS_STATUSES = ['ACCEPTED', 'PICKUP', 'PICKED_UP', 'IN_TRANSIT'];
const IN_TRANSIT_STATUSES = ['PICKUP', 'PICKED_UP', 'IN_TRANSIT'];
const PENDING_STATUSES = ['ASSIGNED', 'ACCEPTED', 'PICKUP', 'PICKED_UP', 'IN_TRANSIT'];

function KpiCard({ icon: Icon, label, value }: { icon: typeof Inbox; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="mb-1 flex items-center gap-2 text-xkwanza-600">
        <Icon size={16} />
        <span className="text-xs font-medium text-neutral-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

function JobRow({ job }: { job: TransportOrder }) {
  return (
    <Link
      to={`/transportador/fretes/${job.id}`}
      className="flex items-center justify-between gap-3 py-3 text-sm hover:bg-neutral-50"
    >
      <div>
        <p className="font-medium text-neutral-900">
          {job.order.items.length} item(ns) · {job.order.shippingAddress.municipality}, {job.order.shippingAddress.province}
        </p>
        <p className="text-neutral-500">{new Date(job.createdAt).toLocaleDateString('pt-AO')}</p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-semibold text-neutral-900">{formatKwanza(Number(job.agreedPrice ?? job.order.total))}</span>
        <TransportStatusBadge status={job.status} />
      </div>
    </Link>
  );
}

export function TransporterDashboard() {
  const [jobs, setJobs] = useState<TransportOrder[]>([]);
  const [stats, setStats] = useState<TransporterStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchMyAssignedJobs(), fetchTransporterStats()])
      .then(([myJobs, transporterStats]) => {
        setJobs(myJobs);
        setStats(transporterStats);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const requested = jobs.filter((j) => j.status === 'ASSIGNED');
  const accepted = jobs.filter((j) => ACCEPTED_STATUSES.includes(j.status));
  const inProgress = jobs.filter((j) => IN_PROGRESS_STATUSES.includes(j.status));
  const inTransit = jobs.filter((j) => IN_TRANSIT_STATUSES.includes(j.status));
  const delivered = jobs.filter((j) => j.status === 'DELIVERED');
  const pending = jobs.filter((j) => PENDING_STATUSES.includes(j.status));

  const upcoming = [...inProgress].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const recentHistory = [...delivered].slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Resumo das operações</h1>
        <p className="text-neutral-500">Acompanhe os seus fretes e rendimentos como transportador AO Market.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <KpiCard icon={Inbox} label="Solicitações recebidas" value={isLoading ? '—' : requested.length} />
        <KpiCard icon={CheckCircle2} label="Serviços aceites" value={isLoading ? '—' : accepted.length} />
        <KpiCard icon={Truck} label="Transportes em curso" value={isLoading ? '—' : inTransit.length} />
        <KpiCard icon={PackageCheck} label="Entregas concluídas" value={isLoading ? '—' : delivered.length} />
        <KpiCard icon={Clock} label="Entregas pendentes" value={isLoading ? '—' : pending.length} />
        <KpiCard icon={HandCoins} label="Receita gerada" value={isLoading ? '—' : formatKwanza(stats?.totalEarnings ?? 0)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Novas solicitações</h2>
            <Link to="/transportador/meus-fretes?status=solicitacoes" className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {!isLoading && requested.length === 0 && <p className="py-4 text-sm text-neutral-500">Sem novas solicitações.</p>}
          {requested.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {requested.slice(0, 5).map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Serviços em andamento</h2>
            <Link to="/transportador/meus-fretes?status=aceites" className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todos
            </Link>
          </div>
          {!isLoading && upcoming.length === 0 && <p className="py-4 text-sm text-neutral-500">Sem serviços em andamento.</p>}
          {upcoming.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {upcoming.slice(0, 5).map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Próximas entregas</h2>
            <Link to="/transportador/meus-fretes?status=transito" className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver todas
            </Link>
          </div>
          {!isLoading && inTransit.length === 0 && <p className="py-4 text-sm text-neutral-500">Sem entregas em trânsito.</p>}
          {inTransit.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {inTransit.slice(0, 5).map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Histórico recente</h2>
            <Link to="/transportador/meus-fretes" className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver histórico completo
            </Link>
          </div>
          {!isLoading && recentHistory.length === 0 && (
            <p className="py-4 text-sm text-neutral-500">Ainda não concluiu nenhuma entrega.</p>
          )}
          {recentHistory.length > 0 && (
            <div className="divide-y divide-neutral-100">
              {recentHistory.map((job) => (
                <JobRow key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-neutral-900">Resumo financeiro</h2>
            <Link to="/transportador/rendimentos" className="text-sm font-medium text-xkwanza-700 hover:underline">
              Ver mais
            </Link>
          </div>
          {stats && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Receita gerada</span>
                <span className="font-semibold text-neutral-900">{formatKwanza(stats.totalEarnings)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Entregas concluídas</span>
                <span className="font-semibold text-neutral-900">{stats.totalDeliveries}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500">Reputação</span>
                <span className="font-semibold text-neutral-900">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '—'}
                  {stats.ratingCount > 0 && <span className="ml-1 font-normal text-neutral-400">({stats.ratingCount})</span>}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
