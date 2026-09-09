import { Link } from 'react-router-dom';

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-50 px-4 text-center">
      <span className="text-3xl font-bold text-xkwanza-600">XKWANZA</span>
      <p className="max-w-xl text-neutral-600">
        Do comércio à formalização. A infraestrutura digital para a evolução económica do cidadão angolano:
        actividade económica → comércio → rendimento → histórico económico → formalização → INSS → protecção
        social.
      </p>
      <div className="flex gap-3">
        <Link to="/entrar" className="rounded-md border border-xkwanza-600 px-5 py-2 font-medium text-xkwanza-600">
          Entrar
        </Link>
        <Link to="/registar" className="rounded-md bg-xkwanza-600 px-5 py-2 font-medium text-white">
          Criar conta
        </Link>
      </div>
    </div>
  );
}
