import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Star, X } from 'lucide-react';
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
];

type SortOption = 'recent' | 'price_asc' | 'price_desc' | 'rating';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Mais recentes' },
  { value: 'price_asc', label: 'Preço: menor para maior' },
  { value: 'price_desc', label: 'Preço: maior para menor' },
  { value: 'rating', label: 'Melhor avaliados' },
];

export function Landing() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainProducts, setMainProducts] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  useEffect(() => {
    fetchCategories()
      .then((all) => setCategories(all.filter((c) => !c.parentId).slice(0, 8)))
      .catch(() => setCategories([]));

    fetchProducts({ listingType: 'PRODUCT', page: 1, pageSize: 20 })
      .then((result) => setFeaturedProducts(result.items.filter((p) => p.isVerified).slice(0, 4)))
      .catch(() => setFeaturedProducts([]));

    fetchProducts({ listingType: 'SERVICE', page: 1, pageSize: 4 })
      .then((result) => setServices(result.items))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    setIsLoadingProducts(true);
    fetchProducts({
      listingType: 'PRODUCT',
      search: appliedSearch || undefined,
      categoryId: categoryId ?? undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      page: 1,
      pageSize: 12,
    })
      .then((result) => setMainProducts(result.items))
      .catch(() => setMainProducts([]))
      .finally(() => setIsLoadingProducts(false));
  }, [appliedSearch, categoryId, minPrice, maxPrice]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setAppliedSearch(search.trim());
    document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' });
  }

  function clearFilters() {
    setSearch('');
    setAppliedSearch('');
    setCategoryId(null);
    setMinPrice('');
    setMaxPrice('');
    setSortBy('recent');
  }

  const hasActiveFilters = Boolean(appliedSearch || categoryId || minPrice || maxPrice);

  const productsToShow = useMemo(() => {
    const items = [...mainProducts];
    switch (sortBy) {
      case 'price_asc':
        return items.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price_desc':
        return items.sort((a, b) => Number(b.price) - Number(a.price));
      case 'rating':
        return items.sort((a, b) => Number(b.averageRating) - Number(a.averageRating));
      default:
        return items;
    }
  }, [mainProducts, sortBy]);

  return (
    <div id="inicio" className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo size={36} onDark={false} />

          <nav className="hidden items-center gap-7 text-sm font-medium text-neutral-600 lg:flex">
            {NAV_LINKS.map((link, i) => (
              <a
                key={link.label}
                href={link.href}
                className={i === 0 ? 'border-b-2 border-gold-400 pb-1 text-neutral-900' : 'pb-1 transition hover:text-neutral-900'}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/entrar"
              className="hidden rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 sm:inline-block"
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

        <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-3 sm:px-6 lg:px-8">
          <form onSubmit={handleSearch} className="mx-auto flex max-w-3xl items-center gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
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
              className="shrink-0 rounded-lg bg-gold-400 px-4 py-2 text-sm font-semibold text-xkwanza-950 transition hover:bg-gold-300"
            >
              Pesquisar
            </button>
          </form>
        </div>
      </header>

      <HeroCarousel />

      {categories.length > 0 && (
        <section id="categorias" className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
          <h2 className="text-lg font-bold text-xkwanza-950">Categorias</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryId(null)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                categoryId === null
                  ? 'border-xkwanza-950 bg-xkwanza-950 text-white'
                  : 'border-neutral-200 text-neutral-700 hover:border-xkwanza-600 hover:text-xkwanza-700'
              }`}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  categoryId === c.id
                    ? 'border-xkwanza-950 bg-xkwanza-950 text-white'
                    : 'border-neutral-200 text-neutral-700 hover:border-xkwanza-600 hover:text-xkwanza-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      <section id="marketplace" className="mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-xkwanza-950">
              {appliedSearch ? `Resultados para "${appliedSearch}"` : 'Produtos recentes'}
            </h2>
            <p className="mt-1 text-neutral-600">Produtos reais publicados por produtores e comerciantes.</p>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-xkwanza-700 hover:underline"
            >
              <X size={14} />
              Limpar filtros
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            Preço mín.
            <input
              type="number"
              min="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="Kz"
              className="w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-xkwanza-600"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-600">
            Preço máx.
            <input
              type="number"
              min="0"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Kz"
              className="w-24 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-xkwanza-600"
            />
          </label>
          <label className="ml-auto flex items-center gap-2 text-sm text-neutral-600">
            Ordenar por
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-lg border border-neutral-300 px-2 py-1.5 text-sm outline-none focus:border-xkwanza-600"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoadingProducts && <p className="text-neutral-500">A carregar...</p>}

        {!isLoadingProducts && productsToShow.length === 0 && (
          <p className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
            {hasActiveFilters ? 'Nenhum resultado encontrado.' : 'Ainda não há produtos publicados.'}
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

      {featuredProducts.length > 0 && (
        <section id="destaques" className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <Star size={22} className="text-gold-500" />
              <h2 className="text-2xl font-extrabold text-xkwanza-950">Produtos em destaque</h2>
            </div>
            <p className="mt-1 text-neutral-600">Produtos verificados por vendedores de confiança na AO Market.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} linkTo="/entrar" />
              ))}
            </div>
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section id="servicos" className="bg-neutral-50 py-16">
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
