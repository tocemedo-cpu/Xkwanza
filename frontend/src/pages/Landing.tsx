import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LineChart,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sprout,
  Store,
  Truck,
  UserPlus,
} from 'lucide-react';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Comprar', href: '#para-quem' },
  { label: 'Vender', href: '#para-quem' },
  { label: 'Transportar', href: '#para-quem' },
  { label: 'Como funciona', href: '#como-funciona' },
  { label: 'Formalização', href: '#para-quem' },
];

const FEATURE_STRIP = [
  { icon: ShieldCheck, label: 'Comprar com segurança' },
  { icon: Store, label: 'Vender facilmente' },
  { icon: PackageCheck, label: 'Entregar com confiança' },
  { icon: LineChart, label: 'Acompanhar os seus rendimentos' },
];

const STEPS = [
  {
    n: '01',
    icon: UserPlus,
    title: 'Criar conta',
    desc: 'Faça o seu registo de forma rápida e segura.',
  },
  {
    n: '02',
    icon: ShoppingCart,
    title: 'Comprar ou vender',
    desc: 'Encontre produtos ou apresente os seus.',
  },
  {
    n: '03',
    icon: Truck,
    title: 'Receber e entregar',
    desc: 'Acompanhe o seu pedido do início ao fim.',
  },
  {
    n: '04',
    icon: LineChart,
    title: 'Construir o seu histórico económico',
    desc: 'A sua actividade gera um histórico de crescimento.',
  },
];

const AUDIENCES = [
  {
    icon: ShoppingBag,
    title: 'Comprador',
    desc: 'Encontre produtos, compare opções e compre com segurança.',
  },
  {
    icon: Sprout,
    title: 'Produtor',
    desc: 'Apresente os seus produtos e alcance novos clientes.',
  },
  {
    icon: Store,
    title: 'Comerciante',
    desc: 'Venda os seus produtos e acompanhe a sua actividade.',
  },
  {
    icon: Truck,
    title: 'Transportador',
    desc: 'Encontre oportunidades de transporte e apresente o seu preço.',
  },
];

export function Landing() {
  return (
    <div id="inicio" className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-green-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-black text-green-950">
              X
            </span>
            <span className="text-lg font-bold tracking-tight">XKWANZA</span>
          </div>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label + i}
                href={link.href}
                className={
                  i === 0
                    ? 'border-b-2 border-amber-400 pb-1 text-white'
                    : 'pb-1 transition hover:text-white'
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Pesquisar"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white sm:flex"
            >
              <Search size={18} />
            </button>
            <Link
              to="/entrar"
              className="hidden rounded-full border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-block"
            >
              Entrar
            </Link>
            <Link
              to="/registar"
              className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-green-950 transition hover:bg-amber-300"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-green-800 pb-28 pt-14 text-white sm:pb-32">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
          <div>
            <div className="mb-5 flex items-center gap-2 text-sm font-medium text-amber-300">
              <span className="inline-block h-4 w-1 rounded-full bg-amber-400" />
              XKWANZA — Do comércio à formalização.
            </div>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Tudo começa com
              <br />
              <span className="text-amber-400">uma actividade.</span>
            </h1>
            <p className="mt-5 max-w-lg text-white/80">
              Compre, venda, entregue, receba e transforme a sua actividade económica numa história de
              crescimento.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/registar"
                className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3 font-semibold text-green-950 transition hover:bg-amber-300"
              >
                Começar agora
                <ArrowRight size={18} />
              </Link>
              <a
                href="#como-funciona"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                Explorar produtos
              </a>
            </div>
          </div>

          <div className="relative hidden aspect-[4/3] items-center justify-center rounded-3xl bg-white/5 ring-1 ring-white/10 lg:flex">
            <div className="grid grid-cols-2 gap-4 p-8 text-white/70">
              <ShoppingBag size={40} className="text-amber-300" />
              <Sprout size={40} className="text-amber-300" />
              <Truck size={40} className="text-amber-300" />
              <LineChart size={40} className="text-amber-300" />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-2xl bg-white p-6 shadow-xl shadow-green-950/10 sm:p-8 lg:grid-cols-4">
          {FEATURE_STRIP.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-950 text-amber-300">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-green-950">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
              <span className="inline-block h-3 w-1 rounded-full bg-amber-400" />
              Como funciona
            </div>
            <h2 className="text-3xl font-extrabold text-green-950">
              É simples. <span className="text-amber-500">Siga estes passos.</span>
            </h2>
            <p className="mt-3 text-neutral-600">
              Em poucos minutos, já pode começar a sua actividade no XKWANZA.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="relative">
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    size={18}
                    className="absolute -right-5 top-6 hidden text-neutral-300 sm:block"
                  />
                )}
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-green-900">
                  <Icon size={22} />
                </span>
                <div className="mb-1 text-sm font-bold text-neutral-400">{n}</div>
                <h3 className="mb-1 font-bold text-green-950">{title}</h3>
                <p className="text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="para-quem" className="bg-emerald-50/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
                <span className="inline-block h-3 w-1 rounded-full bg-amber-400" />
                Para quem é
              </div>
              <h2 className="text-3xl font-extrabold text-green-950">Uma plataforma para todos.</h2>
              <p className="mt-3 text-neutral-600">
                O XKWANZA é feito para pessoas que trabalham, produzem, vendem, transportam e querem
                crescer.
              </p>
              <Link
                to="/registar"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-green-950 px-5 py-2.5 text-sm font-semibold text-green-950 transition hover:bg-green-950 hover:text-white"
              >
                Saiba mais
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-green-900 to-green-700 text-amber-300">
                    <Icon size={36} />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-green-900">
                      <Icon size={16} />
                    </span>
                    <h3 className="font-bold text-green-950">{title}</h3>
                    <p className="flex-1 text-sm text-neutral-600">{desc}</p>
                    <ArrowRight size={16} className="text-green-900" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-100 bg-white py-8 text-center text-sm text-neutral-500">
        <Link to="/entrar" className="font-medium text-green-900 hover:underline">
          Já tem conta? Entrar
        </Link>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <Link to="/termos" className="hover:text-green-900 hover:underline">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-green-900 hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
