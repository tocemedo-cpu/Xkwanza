import { FormEvent, useEffect, useState } from 'react';
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
import { Logo } from '../components/Logo';
import { HeroCarousel } from '../components/HeroCarousel';
import { ProductCard } from '../components/ProductCard';
import { fetchCategories } from '../services/categoriesService';
import { fetchProducts } from '../services/productsService';
import { Category, Product } from '../types/marketplace';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Categorias', href: '#categorias' },
  { label: 'Marketplace', href: '#marketplace' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Como funciona', href: '#como-funciona' },
];

const FEATURE_STRIP = [
  { icon: ShieldCheck, label: 'Comprar com segurança' },
  { icon: Store, label: 'Vender facilmente' },
  { icon: PackageCheck, label: 'Entregar com confiança' },
  { icon: LineChart, label: 'Acompanhar os seus rendimentos' },
];

const STEPS = [
  { n: '01', icon: UserPlus, title: 'Criar conta', desc: 'Faça o seu registo de forma rápida e segura.' },
  { n: '02', icon: ShoppingCart, title: 'Comprar ou vender', desc: 'Encontre produtos ou apresente os seus.' },
  { n: '03', icon: Truck, title: 'Receber e entregar', desc: 'Acompanhe o seu pedido do início ao fim.' },
  {
    n: '04',
    icon: LineChart,
    title: 'Construir o seu histórico económico',
    desc: 'A sua actividade gera um histórico de crescimento.',
  },
];

const AUDIENCES = [
  { icon: ShoppingBag, title: 'Comprador', desc: 'Encontre produtos, compare opções e compre com segurança.' },
  { icon: Sprout, title: 'Produtor', desc: 'Apresente os seus produtos e alcance novos clientes.' },
  { icon: Store, title: 'Comerciante', desc: 'Venda os seus produtos e acompanhe a sua actividade.' },
  { icon: Truck, title: 'Transportador', desc: 'Encontre oportunidades de transporte e apresente o seu preço.' },
];

export function Landing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then((all) => setCategories(all.filter((c) => !c.parentId).slice(0, 8)))
      .catch(() => setCategories([]));

    setIsLoadingProducts(true);
    Promise.all([
      fetchProducts({ listingType: 'PRODUCT', page: 1, pageSize: 8 }),
      fetchProducts({ listingType: 'SERVICE', page: 1, pageSize: 4 }),
    ])
      .then(([products, servicesResult]) => {
        setNewProducts(products.items);
        setServices(servicesResult.items);
      })
      .catch(() => {
        setNewProducts([]);
        setServices([]);
      })
      .finally(() => setIsLoadingProducts(false));
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    const term = search.trim();
    if (!term) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const result = await fetchProducts({ search: term, page: 1, pageSize: 12 });
      setSearchResults(result.items);
      document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' });
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  const productsToShow = searchResults ?? newProducts;

  return (
    <div id="inicio" className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 bg-xkwanza-950 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo size={36} />

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={i === 0 ? 'border-b-2 border-gold-400 pb-1 text-white' : 'pb-1 transition hover:text-white'}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/entrar"
              className="hidden rounded-lg border border-white/30 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:inline-block"
            >
              Entrar
            </Link>
            <Link
              to="/registar"
              className="rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-xkwanza-950 transition hover:bg-gold-300"
            >
              Criar conta
            </Link>
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg bg-white px-3 py-2">
              <Search size={18} className="shrink-0 text-neutral-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar produtos e serviços em Angola..."
                className="w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="shrink-0 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-xkwanza-950 transition hover:bg-gold-300 disabled:opacity-60"
            >
              {isSearching ? '...' : 'Pesquisar'}
            </button>
          </form>
        </div>
      </header>

      <HeroCarousel />

      <div className="relative z-10 mx-auto -mt-16 max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-2xl bg-white p-6 shadow-xl shadow-xkwanza-950/10 sm:p-8 lg:grid-cols-4">
          {FEATURE_STRIP.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-xkwanza-950 text-gold-300">
                <Icon size={20} />
              </span>
              <span className="text-sm font-medium text-xkwanza-950">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {categories.length > 0 && (
        <section id="categorias" className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-xkwanza-950">Categorias</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <Link
                key={c.id}
                to="/entrar"
                className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-xkwanza-600 hover:text-xkwanza-700"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="marketplace" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-xkwanza-950">
              {searchResults ? `Resultados para "${search}"` : 'Novidades no Marketplace'}
            </h2>
            <p className="mt-1 text-neutral-600">Produtos reais publicados por produtores e comerciantes.</p>
          </div>
          {searchResults && (
            <button
              onClick={() => {
                setSearchResults(null);
                setSearch('');
              }}
              className="shrink-0 text-sm font-medium text-xkwanza-700 hover:underline"
            >
              Limpar pesquisa
            </button>
          )}
        </div>

        {isLoadingProducts && <p className="text-neutral-500">A carregar...</p>}

        {!isLoadingProducts && productsToShow.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            {searchResults ? 'Nenhum resultado encontrado.' : 'Ainda não há produtos publicados.'}
          </p>
        )}

        {!isLoadingProducts && productsToShow.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {productsToShow.map((p) => (
              <ProductCard key={p.id} product={p} linkTo="/entrar" />
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/entrar"
            className="inline-flex items-center gap-2 rounded-lg border border-xkwanza-950 px-5 py-2.5 text-sm font-semibold text-xkwanza-950 transition hover:bg-xkwanza-950 hover:text-white"
          >
            Ver todo o marketplace
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {services.length > 0 && (
        <section id="servicos" className="bg-xkwanza-50/70 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-extrabold text-xkwanza-950">Serviços em destaque</h2>
            <p className="mt-1 text-neutral-600">Prestadores de serviços reais já disponíveis na plataforma.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {services.map((s) => (
                <ProductCard key={s.id} product={s} linkTo="/entrar" />
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="como-funciona" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600">
              <span className="inline-block h-3 w-1 rounded-full bg-gold-400" />
              Como funciona
            </div>
            <h2 className="text-3xl font-extrabold text-xkwanza-950">
              É simples. <span className="text-gold-600">Siga estes passos.</span>
            </h2>
            <p className="mt-3 text-neutral-600">Em poucos minutos, já pode começar a sua actividade no XKWANZA.</p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {STEPS.map(({ n, icon: Icon, title, desc }, i) => (
              <div key={n} className="relative">
                {i < STEPS.length - 1 && (
                  <ArrowRight size={18} className="absolute -right-5 top-6 hidden text-neutral-300 sm:block" />
                )}
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-xkwanza-50 text-xkwanza-800">
                  <Icon size={22} />
                </span>
                <div className="mb-1 text-sm font-bold text-neutral-400">{n}</div>
                <h3 className="mb-1 font-bold text-xkwanza-950">{title}</h3>
                <p className="text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="para-quem" className="bg-xkwanza-50/70 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-16">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600">
                <span className="inline-block h-3 w-1 rounded-full bg-gold-400" />
                Para quem é
              </div>
              <h2 className="text-3xl font-extrabold text-xkwanza-950">Uma plataforma para todos.</h2>
              <p className="mt-3 text-neutral-600">
                O XKWANZA é feito para pessoas que trabalham, produzem, vendem, transportam e querem crescer.
              </p>
              <Link
                to="/registar"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-xkwanza-950 px-5 py-2.5 text-sm font-semibold text-xkwanza-950 transition hover:bg-xkwanza-950 hover:text-white"
              >
                Saiba mais
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-xkwanza-900 to-xkwanza-700 text-gold-300">
                    <Icon size={36} />
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-xkwanza-50 text-xkwanza-800">
                      <Icon size={16} />
                    </span>
                    <h3 className="font-bold text-xkwanza-950">{title}</h3>
                    <p className="flex-1 text-sm text-neutral-600">{desc}</p>
                    <ArrowRight size={16} className="text-xkwanza-800" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-100 bg-white py-8 text-center text-sm text-neutral-500">
        <Link to="/entrar" className="font-medium text-xkwanza-800 hover:underline">
          Já tem conta? Entrar
        </Link>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-neutral-400">
          <Link to="/termos" className="hover:text-xkwanza-800 hover:underline">
            Termos de Uso
          </Link>
          <Link to="/privacidade" className="hover:text-xkwanza-800 hover:underline">
            Política de Privacidade
          </Link>
        </div>
      </footer>
    </div>
  );
}
