import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Trash2, Upload } from 'lucide-react';
import { fetchCategories } from '../services/categoriesService';
import {
  addProductPhoto,
  createProduct,
  fetchProduct,
  removeProductPhoto,
  updateProduct,
  uploadProductPhoto,
} from '../services/productsService';
import {
  Category,
  CreateProductPayload,
  DELIVERY_OPTION_LABELS,
  DeliveryOption,
  LISTING_TYPE_LABELS,
  ListingType,
  Product,
} from '../types/marketplace';
import { useAuth } from '../hooks/useAuth';
import { getRolePrefix } from '../types/user';
import { ANGOLA_PROVINCES } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const DELIVERY_OPTIONS: DeliveryOption[] = ['SELLER_DELIVERS', 'BUYER_PICKUP', 'XKWANZA_TRANSPORT'];

export function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const prefix = user ? getRolePrefix(user.role) : 'produtor';

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);

  const [listingType, setListingType] = useState<ListingType>(
    searchParams.get('tipo') === 'servico' ? 'SERVICE' : 'PRODUCT',
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  // A categoria escolhida pelo utilizador vive sempre em categoryId — mainCategoryId é só o
  // estado do primeiro select (categoria principal). Quando a principal não tem subcategorias
  // (ex: Serviços), categoryId = mainCategoryId directamente; quando tem, o utilizador tem de
  // escolher a subcategoria antes de poder submeter.
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [isEstimatedPrice, setIsEstimatedPrice] = useState(false);

  // Produto
  const [unit, setUnit] = useState('unidade');
  const [stock, setStock] = useState('0');
  const [province, setProvince] = useState<string>(ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState('');
  const [origin, setOrigin] = useState('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('BUYER_PICKUP');

  // Serviço
  const [serviceArea, setServiceArea] = useState('');
  const [availability, setAvailability] = useState('');
  const [contact, setContact] = useState(user?.phone ?? user?.email ?? '');

  const [photoUrl, setPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  // Quando a lista de categorias e o produto (em edição) já estão ambos carregados, deriva a
  // categoria principal a partir da categoria guardada: se ela tem mãe, a principal é essa mãe
  // e a categoria guardada é a subcategoria; se não tem mãe, ela própria é a principal (caso dos
  // Serviços, sem subcategorias).
  useEffect(() => {
    if (!product || categories.length === 0) return;
    const current = categories.find((c) => c.id === product.categoryId);
    setMainCategoryId(current?.parentId ?? current?.id ?? '');
  }, [product, categories]);

  useEffect(() => {
    if (!id) return;
    fetchProduct(id).then((p) => {
      setProduct(p);
      setListingType(p.listingType);
      setName(p.name);
      setDescription(p.description);
      setCategoryId(p.categoryId);
      setPrice(p.price);
      setIsEstimatedPrice(p.isEstimatedPrice);
      setUnit(p.unit ?? 'unidade');
      setStock(String(p.stock ?? 0));
      setProvince(p.province ?? ANGOLA_PROVINCES[0]);
      setMunicipality(p.municipality ?? '');
      setOrigin(p.origin ?? '');
      setDeliveryOption(p.deliveryOption ?? 'BUYER_PICKUP');
      setServiceArea(p.serviceArea ?? '');
      setAvailability(p.availability ?? '');
      setContact(p.contact ?? '');
    });
  }, [id]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEditing && id) {
        await updateProduct(id, {
          name,
          description,
          categoryId,
          price: Number(price),
          isEstimatedPrice,
          ...(listingType === 'PRODUCT'
            ? { unit, stock: Number(stock), province, municipality, deliveryOption, origin: origin || undefined }
            : { serviceArea, availability, contact }),
        });
        navigate(`/${prefix}/stock`);
      } else {
        const payload: CreateProductPayload =
          listingType === 'PRODUCT'
            ? {
                listingType: 'PRODUCT',
                name,
                description,
                categoryId,
                price: Number(price),
                isEstimatedPrice,
                unit,
                stock: Number(stock),
                province,
                municipality,
                deliveryOption,
                origin: origin || undefined,
              }
            : {
                listingType: 'SERVICE',
                name,
                description,
                categoryId,
                price: Number(price),
                isEstimatedPrice,
                serviceArea,
                availability,
                contact,
              };
        const created = await createProduct(payload);
        navigate(`/${prefix}/stock/${created.id}/editar`);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar o anúncio.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddPhoto() {
    if (!id || !photoUrl.trim()) return;
    setPhotoError(null);
    try {
      const photo = await addProductPhoto(id, photoUrl.trim());
      setProduct((prev) => (prev ? { ...prev, photos: [...prev.photos, photo] } : prev));
      setPhotoUrl('');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível adicionar a fotografia.';
      setPhotoError(message);
    }
  }

  async function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!id || !file) return;

    setPhotoError(null);
    setIsUploadingPhoto(true);
    try {
      const photo = await uploadProductPhoto(id, file);
      setProduct((prev) => (prev ? { ...prev, photos: [...prev.photos, photo] } : prev));
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a imagem.';
      setPhotoError(message);
    } finally {
      setIsUploadingPhoto(false);
    }
  }

  async function handleRemovePhoto(photoId: string) {
    if (!id) return;
    await removeProductPhoto(id, photoId);
    setProduct((prev) => (prev ? { ...prev, photos: prev.photos.filter((p) => p.id !== photoId) } : prev));
  }

  const isService = listingType === 'SERVICE';
  const mainCategories = categories.filter((c) => !c.parentId);
  const subcategories = categories.filter((c) => c.parentId === mainCategoryId);

  function handleMainCategoryChange(nextMainId: string) {
    setMainCategoryId(nextMainId);
    const hasChildren = categories.some((c) => c.parentId === nextMainId);
    setCategoryId(hasChildren ? '' : nextMainId);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">
        {isEditing ? `Editar ${LISTING_TYPE_LABELS[listingType].toLowerCase()}` : 'Novo anúncio'}
      </h1>

      {!isEditing && (
        <div className="flex gap-1 rounded-full bg-neutral-100 p-1 w-fit">
          {(['PRODUCT', 'SERVICE'] as ListingType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setListingType(type)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                listingType === type ? 'bg-white text-xkwanza-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {LISTING_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">{isService ? 'Nome' : 'Título'}</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria</label>
            <select
              required
              value={mainCategoryId}
              onChange={(e) => handleMainCategoryChange(e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Seleccione...
              </option>
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          {subcategories.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Subcategoria</label>
              <select required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}>
                <option value="" disabled>
                  Seleccione...
                </option>
                {subcategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}
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

        {!isEditing && (
          <p className="rounded-md bg-neutral-50 p-3 text-xs text-neutral-500">
            A fotografia é adicionada a seguir, depois de guardar este primeiro passo — é obrigatória antes de
            publicar.
          </p>
        )}

        <div>
          <label className="mb-1 flex items-center justify-between text-sm font-medium text-neutral-700">
            <span>{isService ? 'Preço/Orçamento (Kz)' : 'Preço (Kz)'}</span>
            {isService && (
              <span className="flex items-center gap-1 font-normal text-neutral-500">
                <input
                  type="checkbox"
                  checked={isEstimatedPrice}
                  onChange={(e) => setIsEstimatedPrice(e.target.checked)}
                />
                É um orçamento (mostrar "a partir de")
              </span>
            )}
          </label>
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

        {isService ? (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Área de atendimento</label>
              <input
                required
                value={serviceArea}
                onChange={(e) => setServiceArea(e.target.value)}
                placeholder="Ex: Luanda, Belas, Viana"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Disponibilidade</label>
              <input
                required
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                placeholder="Ex: Segunda a sábado, 8h-18h"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Contacto</label>
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Telefone ou email para contacto"
                className={inputClass}
              />
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
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
              <label className="mb-1 block text-sm font-medium text-neutral-700">Entrega</label>
              <select
                required
                value={deliveryOption}
                onChange={(e) => setDeliveryOption(e.target.value as DeliveryOption)}
                className={inputClass}
              >
                {DELIVERY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {DELIVERY_OPTION_LABELS[option]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Origem (opcional)</label>
              <input value={origin} onChange={(e) => setOrigin(e.target.value)} className={inputClass} />
            </div>
          </>
        )}

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
            Envie uma foto do seu dispositivo, ou cole o URL de uma imagem já alojada noutro sítio. É necessária
            pelo menos uma fotografia para publicar {isService ? 'o serviço' : 'o produto'}. Depois de a
            adicionar, publique a partir de "Stock".
          </p>

          {photoError && <p className="text-sm text-red-600">{photoError}</p>}

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

          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleFileSelected} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-neutral-300 px-4 py-3 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-60"
          >
            <Upload size={16} />
            {isUploadingPhoto ? 'A enviar...' : 'Enviar foto do dispositivo (JPEG/PNG/WEBP, até 5MB)'}
          </button>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <span className="h-px flex-1 bg-neutral-200" />
            ou por URL
            <span className="h-px flex-1 bg-neutral-200" />
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
