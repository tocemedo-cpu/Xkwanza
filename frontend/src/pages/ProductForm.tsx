import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { fetchCategories } from '../services/categoriesService';
import {
  addProductPhoto,
  createProduct,
  fetchProduct,
  removeProductPhoto,
  updateProduct,
} from '../services/productsService';
import { Category, Product } from '../types/marketplace';
import { ANGOLA_PROVINCES } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('unidade');
  const [stock, setStock] = useState('0');
  const [province, setProvince] = useState<string>(ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState('');
  const [origin, setOrigin] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then((p) => {
      setProduct(p);
      setName(p.name);
      setDescription(p.description);
      setCategoryId(p.categoryId);
      setPrice(p.price);
      setUnit(p.unit);
      setStock(String(p.stock));
      setProvince(p.province);
      setMunicipality(p.municipality);
      setOrigin(p.origin ?? '');
    });
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        categoryId,
        price: Number(price),
        unit,
        stock: Number(stock),
        province,
        municipality,
        origin: origin || undefined,
      };

      if (isEditing && id) {
        await updateProduct(id, payload);
        navigate('/meus-produtos');
      } else {
        const created = await createProduct(payload);
        navigate(`/meus-produtos/${created.id}/editar`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar o produto.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddPhoto() {
    if (!id || !photoUrl.trim()) return;
    const photo = await addProductPhoto(id, photoUrl.trim());
    setProduct((prev) => (prev ? { ...prev, photos: [...prev.photos, photo] } : prev));
    setPhotoUrl('');
  }

  async function handleRemovePhoto(photoId: string) {
    if (!id) return;
    await removeProductPhoto(id, photoId);
    setProduct((prev) => (prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) } : prev));
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">{isEditing ? 'Editar produto' : 'Novo produto'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
          <textarea
            required
            minLength={10}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria</label>
          <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
            <option value="" disabled>
              Seleccione...
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Preço (Kz)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Unidade</label>
            <input required value={unit} onChange={(e) => setUnit(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Stock</label>
            <input
              required
              type="number"
              min={0}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Província</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputClass}>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Município</label>
            <input
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Origem (opcional)</label>
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A guardar...' : 'Guardar'}
        </button>
      </form>

      {isEditing && product && (
        <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="font-semibold text-neutral-900">Fotografias</h2>
          <p className="text-sm text-neutral-500">
            Adicione o URL de uma imagem já alojada (ex: link público de uma foto). É necessária pelo menos uma
            fotografia para publicar o produto.
          </p>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {product.photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md border border-neutral-200">
                <img src={photo.url} alt="" className="h-full w-full object-cover" />
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-red-600 opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleAddPhoto}
              className="shrink-0 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
