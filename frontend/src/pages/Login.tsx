import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { ANGOLA_PHONE_PREFIX } from '../utils/angola';
import { IdentifierMethod, IdentifierMethodToggle } from '../components/IdentifierMethodToggle';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [method, setMethod] = useState<IdentifierMethod>('phone');
  const [phone, setPhone] = useState(ANGOLA_PHONE_PREFIX);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleMethodChange(next: IdentifierMethod) {
    setMethod(next);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const identifier = method === 'phone' ? phone : email;
      const loggedInUser = await login(identifier, password);
      navigate(`/${getRolePrefix(loggedInUser.role)}/dashboard`);
    } catch {
      setError('Telefone/email ou palavra-passe incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Entrar" subtitle="Aceda à sua conta XKWANZA">
      <form onSubmit={handleSubmit} className="space-y-4">
        <IdentifierMethodToggle value={method} onChange={handleMethodChange} />

        {method === 'phone' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Telefone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
              placeholder="+244900000000"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
              placeholder="tu@exemplo.com"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Palavra-passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
          />
          <div className="mt-1 text-right">
            <Link to="/recuperar-password" className="text-sm font-medium text-xkwanza-600 hover:underline">
              Esqueceu a password?
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A entrar...' : 'Entrar'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Ainda não tem conta?{' '}
        <Link to="/registar" className="font-medium text-xkwanza-600 hover:underline">
          Criar conta
        </Link>
      </p>
    </AuthLayout>
  );
}
