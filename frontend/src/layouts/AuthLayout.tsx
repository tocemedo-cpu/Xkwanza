import { ReactNode } from 'react';

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-2xl font-bold text-xkwanza-600">XKWANZA</span>
          <h1 className="mt-3 text-xl font-semibold text-neutral-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">{children}</div>
      </div>
    </div>
  );
}
