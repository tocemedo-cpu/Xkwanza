import { useEffect, useState } from 'react';
import { fetchTransportersForAdmin } from '../services/transportersService';
import { updateUserStatus } from '../services/usersService';
import { TRANSPORTER_CATEGORY_LABELS, Transporter } from '../types/logistics';
import { PaginatedResult } from '../types/marketplace';

export function AdminTransporters() {
  const [result, setResult] = useState<PaginatedResult<Transporter> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchTransportersForAdmin(1, 50)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleToggleActive(transporter: Transporter) {
    if (!transporter.user) return;
    setError(null);
    const nextActive = !transporter.user.isActive;
    if (nextActive === false && !confirm(`Bloquear a conta de ${transporter.user.name}?`)) return;
    try {
      await updateUserStatus(transporter.user.id, { isActive: nextActive });
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível alterar o estado da conta.';
      setError(message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Transportadores</h1>
        <p className="text-neutral-500">Todos os transportadores registados na plataforma.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não há transportadores registados.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((transporter) => (
            <div key={transporter.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  {transporter.user?.name ?? '—'}
                  {transporter.transporterCategory && (
                    <span className="text-neutral-400"> · {TRANSPORTER_CATEGORY_LABELS[transporter.transporterCategory]}</span>
                  )}
                  {transporter.user && !transporter.user.isActive && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Bloqueada
                    </span>
                  )}
                </p>
                <p className="text-neutral-500">
                  {transporter.user?.phone ?? transporter.user?.email ?? '—'} ·{' '}
                  {transporter.vehicleType ?? 'Sem veículo indicado'} ·{' '}
                  {transporter.isAvailable ? 'Disponível' : 'Indisponível'}
                </p>
                {transporter.serviceAreas.length > 0 && (
                  <p className="text-xs text-neutral-400">Zonas: {transporter.serviceAreas.join(', ')}</p>
                )}
              </div>
              {transporter.user && (
                <button
                  onClick={() => handleToggleActive(transporter)}
                  className={`whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium ${
                    transporter.user.isActive
                      ? 'border-red-300 text-red-600 hover:bg-red-50'
                      : 'border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                >
                  {transporter.user.isActive ? 'Bloquear' : 'Desbloquear'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
