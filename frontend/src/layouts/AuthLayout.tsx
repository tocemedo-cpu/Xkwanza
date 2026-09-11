import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../components/Logo';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-xkwanza-50/40">
      <header className="bg-xkwanza-950">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/">
            <Logo size={32} />
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold text-xkwanza-950">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
