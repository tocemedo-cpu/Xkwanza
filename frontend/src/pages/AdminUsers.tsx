import { FormEvent, useEffect, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { adminResetPassword, fetchUsers } from '../services/usersService';
import { ROLE_LABELS, User } from '../types/user';

export function AdminUsers() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ user: User; tempPassword: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  function reload(query?: string) {
    setIsLoading(true);
    fetchUsers({ search: query || undefined, pageSize: 30 })
      .then((result) => setUsers(result.items))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => reload(), []);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    reload(search);
  }

  async function handleReset(user: User) {
    setError(null);
    setResetResult(null);
    if (!confirm(`Repor a palavra-passe de ${user.name} (${user.phone})? A sessão actual dele(a) será terminada.`)) {
      return;
    }
    setResettingId(user.id);
    try {
      const { tempPassword } = await adminResetPassword(user.id);
      setResetResult({ user, tempPassword });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível repor a palavra-passe.';
      setError(message);
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Utilizadores</h1>
        <p className="text-neutral-500">
          Enquanto não existir SMS/email para um fluxo de recuperação self-service, a reposição de
          palavra-passe é feita aqui, por um administrador ou suporte, após confirmar a identidade do
          utilizador por um canal já confiado (ex: chamada telefónica).
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome ou telefone..."
          className="w-full max-w-sm rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
        />
        <button type="submit" className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700">
          Pesquisar
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {resetResult && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm">
          <p className="font-semibold text-amber-900">
            Palavra-passe temporária para {resetResult.user.name} ({resetResult.user.phone}):
          </p>
          <p className="mt-1 select-all font-mono text-lg font-bold text-amber-900">{resetResult.tempPassword}</p>
          <p className="mt-1 text-amber-800">
            Transmite-a agora ao utilizador por um canal seguro (chamada, presencial). Não fica guardada — se
            saíres desta página sem a copiar, terás de repor de novo.
          </p>
          <button
            onClick={() => setResetResult(null)}
            className="mt-2 text-xs font-medium text-amber-900 underline hover:no-underline"
          >
            Fechar
          </button>
        </div>
      )}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && users.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum utilizador encontrado.
        </p>
      )}

      {!isLoading && users.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  {user.name} <span className="text-neutral-400">· {ROLE_LABELS[user.role]}</span>
                </p>
                <p className="text-neutral-500">
                  {user.phone} · {user.municipality}, {user.province}
                </p>
              </div>
              <button
                onClick={() => handleReset(user)}
                disabled={resettingId === user.id}
                className="flex items-center gap-1 whitespace-nowrap rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
              >
                <KeyRound size={14} />
                {resettingId === user.id ? 'A repor...' : 'Repor password'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
