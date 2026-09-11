import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-xkwanza-50/40">
      <header className="bg-xkwanza-950">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold-300 to-gold-500 text-lg font-black text-xkwanza-950">
              X
            </span>
            <span className="text-lg font-bold tracking-tight text-white">XKWANZA</span>
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-white/75 hover:text-white">
            <ArrowLeft size={16} />
            Início
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
          <h1 className="text-2xl font-extrabold text-xkwanza-950 sm:text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-neutral-500">Última actualização: {updatedAt}</p>

          <div className="mt-4 rounded-lg border border-gold-300 bg-gold-50 p-4 text-sm text-gold-900">
            Este documento é um modelo inicial gerado para a plataforma XKWANZA, com base no funcionamento real
            do produto. Ainda não foi revisto por um advogado angolano e não deve ser considerado aconselhamento
            jurídico. Recomenda-se revisão legal antes de qualquer lançamento com utilizadores reais.
          </div>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-neutral-700">{children}</div>
        </div>
      </main>
    </div>
  );
}
