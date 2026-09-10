import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sprout, Store, Truck } from 'lucide-react';
import { AuthLayout } from '../layouts/AuthLayout';
import { ROLE_DESCRIPTIONS, ROLE_LABELS } from '../types/user';

const ROLE_CARDS = [
  { role: 'BUYER' as const, icon: ShoppingBag },
  { role: 'PRODUCER' as const, icon: Sprout },
  { role: 'MERCHANT' as const, icon: Store },
  { role: 'TRANSPORTER' as const, icon: Truck },
];

export function RegisterRoleSelect() {
  return (
    <AuthLayout title="Criar conta" subtitle="Primeiro, diz-nos o que vais fazer no XKWANZA">
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLE_CARDS.map(({ role, icon: Icon }) => (
          <Link
            key={role}
            to={`/registar/${role.toLowerCase()}`}
            className="group flex flex-col gap-2 rounded-xl border border-neutral-200 p-4 text-left transition hover:border-xkwanza-500 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-xkwanza-50 text-xkwanza-700">
              <Icon size={20} />
            </span>
            <span className="font-semibold text-neutral-900">{ROLE_LABELS[role]}</span>
            <span className="text-sm text-neutral-500">{ROLE_DESCRIPTIONS[role]}</span>
            <span className="mt-1 flex items-center gap-1 text-sm font-medium text-xkwanza-600 group-hover:underline">
              Continuar
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-neutral-500">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-xkwanza-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
