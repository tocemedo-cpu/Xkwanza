import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { ANGOLA_PHONE_PREFIX, ANGOLA_PROVINCES } from '../utils/angola';
import { ROLE_LABELS, SELF_REGISTRABLE_ROLES, UserRole } from '../types/user';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState(ANGOLA_PHONE_PREFIX);
  const [password, setPassword] = useState('');
  const [province, setProvince] = useState<string>(ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState('');
  const [role, setRole] = useState<UserRole>('BUYER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({ name, phone, password, province, municipality, role });
      navigate('/painel');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar a conta. Verifique os dados.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Criar conta" subtitle="Comece a comprar ou vender no XKWANZA">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
          />
        </div>
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
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Palavra-passe</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Província</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
            >
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Município</label>
            <input
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Sou</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500"
          >
            {SELF_REGISTRABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-neutral-500">
          Ao criar conta, aceitas os{' '}
          <Link to="/termos" target="_blank" className="font-medium text-xkwanza-600 hover:underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link to="/privacidade" target="_blank" className="font-medium text-xkwanza-600 hover:underline">
            Política de Privacidade
          </Link>{' '}
          da XKWANZA.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-xkwanza-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
