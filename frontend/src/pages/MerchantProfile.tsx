import { FormEvent, useEffect, useState } from 'react';
import { fetchMyMerchantProfile, upsertMyMerchantProfile } from '../services/merchantsService';
import { createDocument, fetchMyDocuments } from '../services/formalizationService';
import { FORMALIZATION_STATE_LABELS, MerchantProfile as MerchantProfileType, SelfDeclaredFormalizationState } from '../types/merchants';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, DocumentType, FormalizationDocument } from '../types/formalization';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

// Documentação relevante para o comerciante — os restantes tipos de Document partilham o
// mesmo endpoint mas não aparecem aqui.
const MERCHANT_DOCUMENT_TYPES: DocumentType[] = ['IDENTITY', 'ACTIVITY_PROOF'];

function toCsv(items: string[]): string {
  return items.join(', ');
}

function fromCsv(text: string): string[] {
  return text
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MerchantProfile() {
  const [profile, setProfile] = useState<MerchantProfileType | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
  const [productCategoriesText, setProductCategoriesText] = useState('');
  const [productsSoldText, setProductsSoldText] = useState('');
  const [formalizationState, setFormalizationState] = useState<SelfDeclaredFormalizationState>('INFORMAL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<FormalizationDocument[]>([]);
  const [docType, setDocType] = useState<DocumentType>('IDENTITY');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    fetchMyMerchantProfile()
      .then((data) => {
        setProfile(data);
        if (data) {
          setBusinessName(data.businessName ?? '');
          setBusinessLocation(data.businessLocation ?? '');
          setProductCategoriesText(toCsv(data.productCategories));
          setProductsSoldText(toCsv(data.productsSold));
          setFormalizationState(data.formalizationState);
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
      const updated = await upsertMyMerchantProfile({
        businessName: businessName || undefined,
        businessLocation: businessLocation || undefined,
        productCategories: fromCsv(productCategoriesText),
        productsSold: fromCsv(productsSoldText),
        formalizationState,
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

  const merchantDocuments = documents.filter((doc) => MERCHANT_DOCUMENT_TYPES.includes(doc.type));

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil de comerciante</h1>
        <p className="text-neutral-500">Dados do negócio e formalização.</p>
        {!profile && <p className="mt-1 text-xs text-neutral-400">Ainda não guardaste nada — tudo é opcional.</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Dados do negócio</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome comercial</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Localização</label>
          <input
            value={businessLocation}
            onChange={(e) => setBusinessLocation(e.target.value)}
            placeholder="Ex: Mercado do Kinaxixi"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Categorias de produtos</label>
          <input
            value={productCategoriesText}
            onChange={(e) => setProductCategoriesText(e.target.value)}
            placeholder="Ex: Vestuário, Calçado"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Produtos vendidos</label>
          <input
            value={productsSoldText}
            onChange={(e) => setProductsSoldText(e.target.value)}
            placeholder="Ex: Camisas, Calças"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
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
          <p className="font-semibold text-neutral-900">Formalização</p>
          <p className="text-xs text-neutral-500">Estado auto-declarado — não substitui a Formalização oficial.</p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Estado de formalização</label>
          <select
            value={formalizationState}
            onChange={(e) => setFormalizationState(e.target.value as SelfDeclaredFormalizationState)}
            className={inputClass}
          >
            {(Object.keys(FORMALIZATION_STATE_LABELS) as SelfDeclaredFormalizationState[]).map((s) => (
              <option key={s} value={s}>
                {FORMALIZATION_STATE_LABELS[s]}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-neutral-500">
            Guarda-se ao clicar em "Guardar" acima, junto com os dados do negócio.
          </p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-neutral-700">Documentação disponível</p>
          {merchantDocuments.length > 0 && (
            <ul className="mb-2 divide-y divide-neutral-100">
              {merchantDocuments.map((doc) => (
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
              {MERCHANT_DOCUMENT_TYPES.map((t) => (
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
    </div>
  );
}
