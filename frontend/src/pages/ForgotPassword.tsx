import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { requestPasswordReset } from '../services/authService';

export function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ message: string; devToken?: string } | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const response = await requestPasswordReset(identifier.trim());
      setResult(response);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível pedir a recuperação de password.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Recuperar password" subtitle="Indique o telefone ou email da sua conta">
      {result ? (
        <div className="space-y-4">
          <p className="text-sm text-neutral-700">{result.message}</p>
          {result.devToken && (
            <div className="rounded-md border border-gold-300 bg-gold-50 p-4 text-sm">
              <p className="font-medium text-gold-900">
                Ambiente de teste sem email configurado — usa este código:
              </p>
              <p className="mt-1 select-all break-all font-mono text-sm font-bold text-gold-900">
                {result.devToken}
              </p>
              <Link
                to={`/repor-password?token=${encodeURIComponent(result.devToken)}`}
                className="mt-3 inline-block rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700"
              >
                Repor password agora
              </Link>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Telefone ou email</label>
            <input
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
              placeholder="+244900000000 ou tu@exemplo.com"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A enviar...' : 'Enviar pedido'}
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
