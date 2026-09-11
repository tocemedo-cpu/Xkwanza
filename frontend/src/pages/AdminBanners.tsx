import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import {
  createBanner,
  deleteBanner,
  fetchAllBanners,
  updateBanner,
  uploadBannerImage,
} from '../services/bannersService';
import { Banner } from '../types/banners';

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export function AdminBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [ctaLabel, setCtaLabel] = useState('');
  const [ctaTo, setCtaTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  function reload() {
    setIsLoading(true);
    fetchAllBanners()
      .then(setBanners)
      .catch((err: unknown) => setError(errorMessage(err, 'Não foi possível carregar os banners.')))
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadBannerImage(file);
      setImageUrl(url);
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível enviar a imagem — pode colar um URL directamente.'));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    if (!imageUrl.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createBanner({
        imageUrl: imageUrl.trim(),
        title: title.trim() || undefined,
        subtitle: subtitle.trim() || undefined,
        ctaLabel: ctaLabel.trim() || undefined,
        ctaTo: ctaTo.trim() || undefined,
        position: banners.length,
      });
      setImageUrl('');
      setTitle('');
      setSubtitle('');
      setCtaLabel('');
      setCtaTo('');
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível criar o banner.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(banner: Banner) {
    try {
      await updateBanner(banner.id, { isActive: !banner.isActive });
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível actualizar o banner.'));
    }
  }

  async function handleDelete(banner: Banner) {
    if (!confirm('Remover este banner?')) return;
    try {
      await deleteBanner(banner.id);
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível remover o banner.'));
    }
  }

  async function handleMove(banner: Banner, direction: -1 | 1) {
    const sorted = [...banners].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((b) => b.id === banner.id);
    const swapWith = sorted[index + direction];
    if (!swapWith) return;
    try {
      await Promise.all([
        updateBanner(banner.id, { position: swapWith.position }),
        updateBanner(swapWith.id, { position: banner.position }),
      ]);
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível reordenar os banners.'));
    }
  }

  const sortedBanners = [...banners].sort((a, b) => a.position - b.position);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Banners da homepage</h1>
        <p className="text-neutral-500">
          Imagens e textos do carrossel de destaque na página inicial pública. Quando não houver nenhum banner
          activo, a homepage mostra o conteúdo ilustrativo por omissão.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-neutral-900">Novo banner</h2>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-xkwanza-300 px-3 py-2 text-sm font-medium text-xkwanza-700 hover:bg-xkwanza-50">
            <ImagePlus size={16} />
            {isUploading ? 'A enviar...' : 'Carregar imagem'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileSelected} disabled={isUploading} />
          </label>
          <span className="text-xs text-neutral-400">ou</span>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Colar URL da imagem"
            className={`${inputClass} flex-1 min-w-[220px]`}
          />
        </div>

        {imageUrl && (
          <img src={imageUrl} alt="Pré-visualização" className="h-32 w-full rounded-lg object-cover" />
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" className={inputClass} />
          <input value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} placeholder="Texto do botão (opcional)" className={inputClass} />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtítulo (opcional)"
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            value={ctaTo}
            onChange={(e) => setCtaTo(e.target.value)}
            placeholder="Destino do botão, ex: /registar (opcional)"
            className={`${inputClass} sm:col-span-2`}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !imageUrl.trim()}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A criar...' : 'Adicionar banner'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && sortedBanners.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não há banners configurados — a homepage está a mostrar o conteúdo ilustrativo por omissão.
        </p>
      )}

      {!isLoading && sortedBanners.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {sortedBanners.map((banner, index) => (
            <div key={banner.id} className="flex flex-wrap items-center gap-4 p-4">
              <img src={banner.imageUrl} alt={banner.title ?? ''} className="h-16 w-24 shrink-0 rounded-md object-cover" />
              <div className="min-w-[160px] flex-1">
                <p className="font-medium text-neutral-900">{banner.title || '(sem título)'}</p>
                <p className="truncate text-xs text-neutral-500">{banner.subtitle || banner.imageUrl}</p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  banner.isActive ? 'bg-xkwanza-100 text-xkwanza-700' : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {banner.isActive ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(banner, -1)}
                  disabled={index === 0}
                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Mover para cima"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => handleMove(banner, 1)}
                  disabled={index === sortedBanners.length - 1}
                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
                  aria-label="Mover para baixo"
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {banner.isActive ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => handleDelete(banner)} className="text-neutral-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
