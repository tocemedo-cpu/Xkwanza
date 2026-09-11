import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Trash2 } from 'lucide-react';
import {
  addRouteStop,
  createRoute,
  fetchMyRoutes,
  removeRouteStop,
  updateRouteStop,
} from '../services/transporterRoutesService';
import { fetchMyAssignedJobs } from '../services/transportService';
import { TransportOrder } from '../types/logistics';
import {
  ROUTE_STATUS_LABELS,
  ROUTE_STOP_STATUS_LABELS,
  Route,
  RouteStop,
  RouteStopStatus,
} from '../types/routes';

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

const STOP_STATUS_STYLES: Record<RouteStopStatus, string> = {
  PENDING: 'bg-neutral-100 text-neutral-700',
  COMPLETED: 'bg-xkwanza-100 text-xkwanza-600',
  SKIPPED: 'bg-gold-100 text-gold-700',
};

const ROUTE_STATUS_STYLES: Record<Route['status'], string> = {
  PLANNED: 'bg-neutral-100 text-neutral-700',
  IN_PROGRESS: 'bg-gold-100 text-gold-700',
  COMPLETED: 'bg-xkwanza-100 text-xkwanza-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

// Não há provedor de mapas/geocodificação (ex: Google Maps/Mapbox) configurado neste ambiente,
// por isso não há trajecto sugerido, distância ou ETA — apenas uma lista de paragens que o
// próprio transportador ordena manualmente, arrastando-as para cima/baixo.
export function Rotas() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [plannedDate, setPlannedDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  const [assignedJobs, setAssignedJobs] = useState<TransportOrder[]>([]);
  const [jobsLoaded, setJobsLoaded] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [stopBusyId, setStopBusyId] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchMyRoutes()
      .then(setRoutes)
      .catch((err) => setError(errorMessage(err, 'Não foi possível carregar as rotas.')))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleCreateRoute(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsCreating(true);
    try {
      const route = await createRoute({
        name,
        plannedDate: plannedDate ? new Date(plannedDate).toISOString() : undefined,
      });
      setName('');
      setPlannedDate('');
      reload();
      setExpandedRouteId(route.id);
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível criar a rota.'));
    } finally {
      setIsCreating(false);
    }
  }

  function toggleExpand(routeId: string) {
    setExpandedRouteId((current) => (current === routeId ? null : routeId));
    setSelectedJobId('');
  }

  function ensureJobsLoaded() {
    if (jobsLoaded) return;
    fetchMyAssignedJobs()
      .then((jobs) => {
        setAssignedJobs(jobs);
        setJobsLoaded(true);
      })
      .catch((err) => setError(errorMessage(err, 'Não foi possível carregar os seus fretes.')));
  }

  const expandedRoute = routes.find((r) => r.id === expandedRouteId) ?? null;

  const availableJobs = useMemo(() => {
    if (!expandedRoute) return [];
    const usedOrderIds = new Set(expandedRoute.stops.map((s) => s.transportOrderId));
    return assignedJobs.filter((job) => !usedOrderIds.has(job.id) && job.status !== 'CANCELLED');
  }, [assignedJobs, expandedRoute]);

  async function handleAddStop(event: FormEvent) {
    event.preventDefault();
    if (!expandedRoute || !selectedJobId) return;
    setError(null);
    setIsAddingStop(true);
    try {
      await addRouteStop(expandedRoute.id, { transportOrderId: selectedJobId });
      setSelectedJobId('');
      reload();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível adicionar o frete à rota.'));
    } finally {
      setIsAddingStop(false);
    }
  }

  async function handleMoveStop(route: Route, stop: RouteStop, direction: 'up' | 'down') {
    const sorted = [...route.stops].sort((a, b) => a.sequence - b.sequence);
    const index = sorted.findIndex((s) => s.id === stop.id);
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    if (index === -1 || neighborIndex < 0 || neighborIndex >= sorted.length) return;
    const neighbor = sorted[neighborIndex];

    setError(null);
    setStopBusyId(stop.id);
    try {
      await updateRouteStop(route.id, stop.id, { sequence: neighbor.sequence });
      await updateRouteStop(route.id, neighbor.id, { sequence: stop.sequence });
      reload();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível reordenar as paragens.'));
    } finally {
      setStopBusyId(null);
    }
  }

  async function handleStopStatus(route: Route, stop: RouteStop, status: RouteStopStatus) {
    setError(null);
    setStopBusyId(stop.id);
    try {
      await updateRouteStop(route.id, stop.id, { status });
      reload();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível actualizar o estado da paragem.'));
    } finally {
      setStopBusyId(null);
    }
  }

  async function handleRemoveStop(route: Route, stop: RouteStop) {
    if (!confirm('Remover esta paragem da rota?')) return;
    setError(null);
    setStopBusyId(stop.id);
    try {
      await removeRouteStop(route.id, stop.id);
      reload();
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível remover a paragem.'));
    } finally {
      setStopBusyId(null);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Rotas</h1>
        <p className="text-neutral-500">
          Organize os seus fretes atribuídos em rotas e defina a ordem das paragens manualmente. Não há mapa nem
          cálculo automático de trajecto/distância — a app ainda não tem um provedor de mapas configurado — é
          apenas uma lista ordenada por si.
        </p>
      </div>

      <form onSubmit={handleCreateRoute} className="flex flex-wrap items-end gap-2 rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Nome da rota</label>
          <input
            required
            minLength={3}
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Entregas de sexta-feira"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-neutral-600">Data planeada (opcional)</label>
          <input
            type="date"
            value={plannedDate}
            onChange={(e) => setPlannedDate(e.target.value)}
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isCreating ? 'A criar...' : 'Nova rota'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && routes.length === 0 && (
        <p className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
          <MapPin size={32} className="text-neutral-300" />
          Ainda não criou nenhuma rota. Use o formulário acima para começar.
        </p>
      )}

      {!isLoading && routes.length > 0 && (
        <div className="space-y-3">
          {routes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            const sortedStops = [...route.stops].sort((a, b) => a.sequence - b.sequence);
            return (
              <div key={route.id} className="rounded-xl border border-neutral-200 bg-white">
                <button
                  onClick={() => {
                    toggleExpand(route.id);
                    if (!isExpanded) ensureJobsLoaded();
                  }}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <p className="font-medium text-neutral-900">{route.name}</p>
                    <p className="text-sm text-neutral-500">
                      {route.plannedDate
                        ? new Date(route.plannedDate).toLocaleDateString('pt-AO')
                        : 'Sem data planeada'}{' '}
                      · {route.stops.length} paragem(ns)
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ROUTE_STATUS_STYLES[route.status]}`}>
                      {ROUTE_STATUS_LABELS[route.status]}
                    </span>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="space-y-4 border-t border-neutral-100 p-4">
                    {sortedStops.length === 0 && (
                      <p className="text-sm text-neutral-500">Esta rota ainda não tem paragens.</p>
                    )}

                    {sortedStops.length > 0 && (
                      <ol className="space-y-2">
                        {sortedStops.map((stop, index) => {
                          const address = stop.transportOrder.order.shippingAddress;
                          const busy = stopBusyId === stop.id;
                          return (
                            <li
                              key={stop.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-100 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-600">
                                  {index + 1}
                                </span>
                                <div>
                                  <p className="font-medium text-neutral-900">
                                    {address.municipality}
                                    {address.locality ? `, ${address.locality}` : ''}
                                  </p>
                                  <p className="text-xs text-neutral-500">{address.province}</p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STOP_STATUS_STYLES[stop.status]}`}
                                >
                                  {ROUTE_STOP_STATUS_LABELS[stop.status]}
                                </span>

                                <select
                                  value={stop.status}
                                  disabled={busy}
                                  onChange={(e) => handleStopStatus(route, stop, e.target.value as RouteStopStatus)}
                                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-xkwanza-500 focus:outline-none"
                                >
                                  <option value="PENDING">Pendente</option>
                                  <option value="COMPLETED">Concluída</option>
                                  <option value="SKIPPED">Ignorada</option>
                                </select>

                                <button
                                  onClick={() => handleMoveStop(route, stop, 'up')}
                                  disabled={busy || index === 0}
                                  title="Mover para cima"
                                  className="rounded-md border border-neutral-300 p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => handleMoveStop(route, stop, 'down')}
                                  disabled={busy || index === sortedStops.length - 1}
                                  title="Mover para baixo"
                                  className="rounded-md border border-neutral-300 p-1.5 text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                                >
                                  <ChevronDown size={14} />
                                </button>
                                <button
                                  onClick={() => handleRemoveStop(route, stop)}
                                  disabled={busy}
                                  title="Remover paragem"
                                  className="rounded-md border border-neutral-300 p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    )}

                    <form onSubmit={handleAddStop} className="flex flex-wrap items-end gap-2 border-t border-neutral-100 pt-4">
                      <div className="flex flex-1 flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-600">Adicionar frete a esta rota</label>
                        <select
                          value={selectedJobId}
                          onChange={(e) => setSelectedJobId(e.target.value)}
                          className={inputClass}
                        >
                          <option value="">
                            {availableJobs.length === 0 ? 'Sem fretes disponíveis para adicionar' : 'Seleccione um frete...'}
                          </option>
                          {availableJobs.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.order.shippingAddress.municipality}, {job.order.shippingAddress.province} ·{' '}
                              {job.order.items.length} item(ns)
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={isAddingStop || !selectedJobId}
                        className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
                      >
                        {isAddingStop ? 'A adicionar...' : 'Adicionar'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
