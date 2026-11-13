import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';

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
    <div className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/">
            <Logo size={32} onDark={false} />
          </Link>
          <Link to="/" className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900">
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
            Este documento é um modelo inicial gerado para a plataforma AO Market, com base no funcionamento real
            do produto. Ainda não foi revisto por um advogado angolano e não deve ser considerado aconselhamento
            jurídico. Recomenda-se revisão legal antes de qualquer lançamento com utilizadores reais.
          </div>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-neutral-700">{children}</div>
        </div>
      </main>
    </div>
  );
}
