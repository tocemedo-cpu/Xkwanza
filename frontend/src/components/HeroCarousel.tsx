import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LucideIcon, LineChart, ShoppingBag, Sprout, Truck } from 'lucide-react';
import { fetchActiveBanners } from '../services/bannersService';
import { Banner } from '../types/banners';

// Conteúdo promocional ilustrativo (mock) — usado como valor por omissão enquanto a
// administração não configurar banners reais em /admin/banners. As secções abaixo
// (categorias, produtos, serviços) é que mostram sempre dados reais vindos da API.
interface Slide {
  icon?: LucideIcon;
  imageUrl?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaTo: string;
}

const FALLBACK_SLIDES: Slide[] = [
  {
    icon: ShoppingBag,
    eyebrow: 'XKWANZA — Do comércio à formalização',
    title: 'Tudo começa com uma actividade.',
    subtitle: 'Compre, venda, entregue e transforme a sua actividade económica numa história de crescimento.',
    ctaLabel: 'Começar agora',
    ctaTo: '/registar',
  },
  {
    icon: Sprout,
    eyebrow: 'Para produtores e comerciantes',
    title: 'Venda os seus produtos a todo o país.',
    subtitle: 'Publique o seu catálogo, receba pedidos e acompanhe as suas vendas num só lugar.',
    ctaLabel: 'Começar a vender',
    ctaTo: '/registar/producer',
  },
  {
    icon: Truck,
    eyebrow: 'Para transportadores',
    title: 'Leve as entregas mais longe.',
    subtitle: 'Encontre fretes disponíveis, apresente o seu preço e organize as suas rotas.',
    ctaLabel: 'Ser transportador',
    ctaTo: '/registar/transporter',
  },
  {
    icon: LineChart,
    eyebrow: 'Histórico económico',
    title: 'Construa o seu histórico de crescimento.',
    subtitle: 'Cada venda, entrega e avaliação contribui para o seu percurso rumo à formalização.',
    ctaLabel: 'Saber mais',
    ctaTo: '/registar',
  },
];

function toSlide(banner: Banner): Slide {
  return {
    imageUrl: banner.imageUrl,
    eyebrow: 'XKWANZA',
    title: banner.title ?? '',
    subtitle: banner.subtitle ?? '',
    ctaLabel: banner.ctaLabel ?? 'Explorar',
    ctaTo: banner.ctaTo ?? '/registar',
  };
}

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [slides, setSlides] = useState<Slide[]>(FALLBACK_SLIDES);

  useEffect(() => {
    fetchActiveBanners()
      .then((banners) => {
        if (banners.length > 0) setSlides(banners.map(toSlide));
      })
      .catch(() => {
        // Mantém o conteúdo ilustrativo por omissão em caso de falha.
      });
  }, []);

  useEffect(() => {
    setActive(0);
    const t = setInterval(() => setActive((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [slides]);

  const slide = slides[active];
  const Icon = slide.icon;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-xkwanza-950 via-xkwanza-900 to-xkwanza-800 pb-28 pt-14 text-white sm:pb-32">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div>
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-gold-300">
            <span className="inline-block h-4 w-1 rounded-full bg-gold-400" />
            {slide.eyebrow}
          </div>
          <h1 className="min-h-[5rem] text-4xl font-extrabold leading-tight tracking-tight sm:min-h-[7rem] sm:text-5xl">
            {slide.title}
          </h1>
          <p className="mt-5 max-w-lg text-white/80">{slide.subtitle}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to={slide.ctaTo}
              className="inline-flex items-center gap-2 rounded-lg bg-gold-400 px-6 py-3 font-semibold text-xkwanza-950 transition hover:bg-gold-300"
            >
              {slide.ctaLabel}
              <ArrowRight size={18} />
            </Link>
            <a
              href="#marketplace"
              className="inline-flex items-center gap-2 rounded-lg border border-white/40 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              Explorar produtos
            </a>
          </div>
          <div className="mt-8 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={`${s.title}-${i}`}
                aria-label={`Destaque ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${i === active ? 'w-8 bg-gold-400' : 'w-3 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>
        </div>

        <div className="relative hidden aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10 lg:flex">
          {slide.imageUrl ? (
            <img src={slide.imageUrl} alt={slide.title} className="h-full w-full object-cover" />
          ) : Icon ? (
            <Icon size={96} className="text-gold-300" strokeWidth={1.25} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
