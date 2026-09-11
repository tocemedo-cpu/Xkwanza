import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { fetchVerificationRequests, reviewVerification } from '../services/usersService';
import { getContact, ROLE_LABELS, User } from '../types/user';

export function AdminVerifications() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectReasons, setRejectReasons] = useState<Record<string, string>>({});

  function reload() {
    setIsLoading(true);
    fetchVerificationRequests({ page, pageSize })
      .then((result) => {
        setUsers(result.items);
        setTotal(result.total);
      })
      .catch(() => setError('Não foi possível carregar os pedidos de validação.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [page]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  async function handleApprove(user: User) {
    setError(null);
    setProcessingId(user.id);
    try {
      await reviewVerification(user.id, { approve: true });
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível aprovar o pedido.';
      setError(message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(user: User) {
    const note = (rejectReasons[user.id] ?? '').trim();
    if (!note) return;
    setError(null);
    setProcessingId(user.id);
    try {
      await reviewVerification(user.id, { approve: false, note });
      setRejectReasons((prev) => {
        const next = { ...prev };
        delete next[user.id];
        return next;
      });
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível rejeitar o pedido.';
      setError(message);
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Validação de perfis</h1>
        <p className="text-neutral-500">Pedidos de validação do selo XKWANZA Verificado, por ordem de chegada.</p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && users.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum pedido pendente.
        </p>
      )}

      {!isLoading && users.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {users.map((user) => (
            <div key={user.id} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  {user.name} <span className="text-neutral-400">· {ROLE_LABELS[user.role]}</span>
                </p>
                <p className="text-neutral-500">{getContact(user)}</p>
                {user.verificationRequestedAt && (
                  <p className="mt-1 text-xs text-neutral-400">
                    Pedido em {new Date(user.verificationRequestedAt).toLocaleDateString('pt-AO')}
                  </p>
                )}
              </div>
              <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-none">
                <button
                  onClick={() => handleApprove(user)}
                  disabled={processingId === user.id}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md border border-xkwanza-300 px-3 py-1.5 text-xs font-medium text-xkwanza-600 hover:bg-xkwanza-50 disabled:opacity-60"
                >
                  <Check size={14} />
                  Aprovar
                </button>
                <input
                  value={rejectReasons[user.id] ?? ''}
                  onChange={(e) => setRejectReasons((prev) => ({ ...prev, [user.id]: e.target.value }))}
                  placeholder="Motivo da rejeição (obrigatório)"
                  className="w-56 rounded-md border border-neutral-300 px-2 py-1.5 text-xs focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
                />
                <button
                  onClick={() => handleReject(user)}
                  disabled={processingId === user.id || !(rejectReasons[user.id] ?? '').trim()}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                >
                  <X size={14} />
                  Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-neutral-500">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Seguinte
          </button>
        </div>
      )}
    </div>
  );
}
