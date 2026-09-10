import { FormEvent, useEffect, useState } from 'react';
import { fetchMyProducerProfile, upsertMyProducerProfile } from '../services/producersService';
import { createDocument, fetchMyDocuments } from '../services/formalizationService';
import { ProducerProfile as ProducerProfileType } from '../types/producers';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, DocumentType, FormalizationDocument } from '../types/formalization';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

// Documentação relevante para o produtor — os restantes tipos de Document partilham o mesmo
// endpoint mas não aparecem aqui.
const PRODUCER_DOCUMENT_TYPES: DocumentType[] = ['IDENTITY', 'ACTIVITY_PROOF'];

function toCsv(items: string[]): string {
  return items.join(', ');
}

function fromCsv(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProducerProfile() {
  const [profile, setProfile] = useState<ProducerProfileType | null>(null);
  const [productionLocation, setProductionLocation] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [productCategoriesText, setProductCategoriesText] = useState('');
  const [productsProducedText, setProductsProducedText] = useState('');
  const [productionCapacity, setProductionCapacity] = useState('');
  const [productionUnit, setProductionUnit] = useState('');
  const [referencePrice, setReferencePrice] = useState('');
  const [availability, setAvailability] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<FormalizationDocument[]>([]);
  const [docType, setDocType] = useState<DocumentType>('IDENTITY');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    fetchMyProducerProfile()
      .then((data) => {
        setProfile(data);
        if (data) {
          setProductionLocation(data.productionLocation ?? '');
          setBusinessName(data.businessName ?? '');
          setProductCategoriesText(toCsv(data.productCategories));
          setProductsProducedText(toCsv(data.productsProduced));
          setProductionCapacity(data.productionCapacity ?? '');
          setProductionUnit(data.productionUnit ?? '');
          setReferencePrice(data.referencePrice ?? '');
          setAvailability(data.availability ?? '');
          setDescription(data.description ?? '');
        }
      })
      .finally(() => setIsLoading(false));
    fetchMyDocuments().then(setDocuments);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await upsertMyProducerProfile({
        productionLocation: productionLocation || undefined,
        businessName: businessName || undefined,
        productCategories: fromCsv(productCategoriesText),
        productsProduced: fromCsv(productsProducedText),
        productionCapacity: productionCapacity || undefined,
        productionUnit: productionUnit || undefined,
        referencePrice: referencePrice || undefined,
        availability: availability || undefined,
        description: description || undefined,
      });
      setProfile(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar o perfil.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!docUrl.trim()) return;
    await createDocument(docType, docUrl.trim());
    setDocUrl('');
    fetchMyDocuments().then(setDocuments);
  }

  if (isLoading) return <p className="text-neutral-500">A carregar...</p>;

  const producerDocuments = documents.filter((doc) => PRODUCER_DOCUMENT_TYPES.includes(doc.type));

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil de produtor</h1>
        <p className="text-neutral-500">Dados da actividade, descrição e documentação.</p>
        {!profile && <p className="mt-1 text-xs text-neutral-400">Ainda não guardaste nada — tudo é opcional.</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Dados da actividade</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Localização da produção</label>
          <input value={productionLocation} onChange={(e) => setProductionLocation(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome do negócio/produção</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Categoria de produtos</label>
          <input
            value={productCategoriesText}
            onChange={(e) => setProductCategoriesText(e.target.value)}
            placeholder="Ex: Hortícolas, Fruta"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Produtos produzidos</label>
          <input
            value={productsProducedText}
            onChange={(e) => setProductsProducedText(e.target.value)}
            placeholder="Ex: Tomate, Cebola"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Capacidade de produção</label>
            <input
              value={productionCapacity}
              onChange={(e) => setProductionCapacity(e.target.value)}
              placeholder="Ex: 200 kg/semana"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Unidade de medida</label>
            <input
              value={productionUnit}
              onChange={(e) => setProductionUnit(e.target.value)}
              placeholder="Ex: kg, saca, litro"
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Preço</label>
            <input
              value={referencePrice}
              onChange={(e) => setReferencePrice(e.target.value)}
              placeholder="Ex: 500 Kz/kg"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Disponibilidade</label>
            <input
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              placeholder="Ex: Todo o ano"
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição da actividade</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputClass}
          />
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

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <div>
          <p className="font-semibold text-neutral-900">Documentação</p>
          <p className="text-xs text-neutral-500">
            Opcional — documentos de identificação/formalização e comprovativos da actividade, quando aplicável.
          </p>
        </div>

        {producerDocuments.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {producerDocuments.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-neutral-700">{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {DOCUMENT_STATUS_LABELS[doc.status]}
                </span>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleUploadDocument} className="flex gap-2">
          <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)} className={inputClass}>
            {PRODUCER_DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          <button
            type="submit"
            className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
