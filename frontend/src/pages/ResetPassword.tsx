import { FormEvent, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { resetPassword } from '../services/authService';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('As passwords não coincidem.');
      return;
    }
    setIsSubmitting(true);
    try {
      await resetPassword(token.trim(), password);
      setSuccess(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível repor a password. O código pode ter expirado.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Repor password" subtitle="Defina uma nova password para a sua conta">
      {success ? (
        <div className="space-y-4">
          <p className="text-sm text-xkwanza-600">Password reposta com sucesso.</p>
          <Link
            to="/entrar"
            className="block w-full rounded-md bg-xkwanza-600 px-4 py-2 text-center font-medium text-white hover:bg-xkwanza-700"
          >
            Entrar
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Código de recuperação</label>
            <input
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
              placeholder="Código recebido por email ou SMS"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Nova password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
            />
            <p className="mt-1 text-xs text-neutral-500">Mínimo de 8 caracteres.</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Confirmar nova password</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A repor...' : 'Repor password'}
          </button>
        </form>
      )}
      <p className="mt-4 text-center text-sm text-neutral-500">
        Lembrou-se da password?{' '}
        <Link to="/entrar" className="font-medium text-xkwanza-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
