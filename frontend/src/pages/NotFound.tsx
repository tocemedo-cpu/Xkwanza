import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-3xl font-bold text-neutral-900">Página não encontrada</h1>
      <p className="text-neutral-500">A página que procura não existe ou foi movida.</p>
      <Link to="/" className="mt-4 text-xkwanza-600 hover:underline">
        Voltar ao início
      </Link>
    </div>
  );
}
