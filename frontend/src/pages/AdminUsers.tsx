import { FormEvent, useEffect, useState } from 'react';
import { KeyRound, ShieldCheck, ShieldOff } from 'lucide-react';
import { adminResetPassword, fetchUsers, updateUserStatus } from '../services/usersService';
import { getContact, ROLE_LABELS, User, UserRole } from '../types/user';

const PAGE_TITLES: Partial<Record<UserRole, { title: string; subtitle: string }>> = {
  PRODUCER: { title: 'Produtores', subtitle: 'Todas as contas de produtores registadas na plataforma.' },
  BUYER: { title: 'Compradores', subtitle: 'Todas as contas de compradores registadas na plataforma.' },
};

export function AdminUsers({ role }: { role?: UserRole } = {}) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<{ user: User; tempPassword: string } | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  function reload(query?: string) {
    setIsLoading(true);
    fetchUsers({ search: query || undefined, role, pageSize: 30 })
      .then((result) => setUsers(result.items))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => reload(), [role]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    reload(search);
  }

  async function handleToggleActive(user: User) {
    setError(null);
    const nextActive = !user.isActive;
    if (nextActive === false && !confirm(`Bloquear a conta de ${user.name}? Deixa de conseguir entrar.`)) {
      return;
    }
    try {
      const updated = await updateUserStatus(user.id, { isActive: nextActive });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível alterar o estado da conta.';
      setError(message);
    }
  }

  async function handleToggleVerified(user: User) {
    setError(null);
    try {
      const updated = await updateUserStatus(user.id, { isVerifiedBadge: !user.isVerifiedBadge });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível alterar a validação da conta.';
      setError(message);
    }
  }

  async function handleReset(user: User) {
    setError(null);
    setResetResult(null);
    if (!confirm(`Repor a palavra-passe de ${user.name} (${getContact(user)})? A sessão actual dele(a) será terminada.`)) {
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
        <h1 className="text-2xl font-bold text-neutral-900">{PAGE_TITLES[role ?? 'ADMIN']?.title ?? 'Utilizadores'}</h1>
        <p className="text-neutral-500">
          {PAGE_TITLES[role ?? 'ADMIN']?.subtitle ??
            'Enquanto não existir SMS/email para um fluxo de recuperação self-service, a reposição de palavra-passe é feita aqui, por um administrador ou suporte, após confirmar a identidade do utilizador por um canal já confiado (ex: chamada telefónica).'}
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome, telefone ou email..."
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
            Palavra-passe temporária para {resetResult.user.name} ({getContact(resetResult.user)}):
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
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  {user.name} <span className="text-neutral-400">· {ROLE_LABELS[user.role]}</span>
                  {user.isVerifiedBadge && <ShieldCheck size={14} className="ml-1 inline text-xkwanza-600" />}
                  {!user.isActive && (
                    <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                      Bloqueada
                    </span>
                  )}
                </p>
                <p className="text-neutral-500">
                  {getContact(user)} · {user.municipality}, {user.province}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleToggleVerified(user)}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                >
                  <ShieldCheck size={14} />
                  {user.isVerifiedBadge ? 'Remover validação' : 'Validar conta'}
                </button>
                <button
                  onClick={() => handleToggleActive(user)}
                  className={`flex items-center gap-1 whitespace-nowrap rounded-md border px-3 py-1.5 text-xs font-medium ${
                    user.isActive
                      ? 'border-red-300 text-red-600 hover:bg-red-50'
                      : 'border-green-300 text-green-700 hover:bg-green-50'
                  }`}
                >
                  <ShieldOff size={14} />
                  {user.isActive ? 'Bloquear' : 'Desbloquear'}
                </button>
                <button
                  onClick={() => handleReset(user)}
                  disabled={resettingId === user.id}
                  className="flex items-center gap-1 whitespace-nowrap rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-60"
                >
                  <KeyRound size={14} />
                  {resettingId === user.id ? 'A repor...' : 'Repor password'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
