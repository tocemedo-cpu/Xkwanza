import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import {
  completeStage,
  createDocument,
  fetchMyDocuments,
  fetchMyDossier,
  updateDossier,
} from '../services/formalizationService';
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_TYPE_LABELS,
  DocumentType,
  FORMALIZATION_STATUS_LABELS,
  FormalizationDocument,
  FormalizationDossier,
} from '../types/formalization';
import { ANGOLA_PROVINCES } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const DOCUMENT_TYPES: DocumentType[] = ['IDENTITY', 'DELIVERY_PROOF', 'VEHICLE_DOCUMENT', 'RECEIPT', 'OTHER'];

export function Formalization() {
  const [dossier, setDossier] = useState<FormalizationDossier | null | undefined>(undefined);
  const [documents, setDocuments] = useState<FormalizationDocument[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [province, setProvince] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [marketLocation, setMarketLocation] = useState('');
  const [nif, setNif] = useState('');
  const [niss, setNiss] = useState('');

  const [docType, setDocType] = useState<DocumentType>('IDENTITY');
  const [docUrl, setDocUrl] = useState('');

  function reload() {
    fetchMyDossier().then((data) => {
      setDossier(data);
      if (data) {
        setBusinessName(data.businessName ?? '');
        setProvince(data.province ?? '');
        setMunicipality(data.municipality ?? '');
        setMarketLocation(data.marketLocation ?? '');
        setNif(data.nif ?? '');
        setNiss(data.niss ?? '');
      }
    });
    fetchMyDocuments().then(setDocuments);
  }

  useEffect(reload, []);

  async function handleCompleteStage(stageNumber: number) {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await completeStage(stageNumber);
      setDossier(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível concluir a etapa.';
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveDossier(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const updated = await updateDossier({
        businessName: businessName || undefined,
        province: province || undefined,
        municipality: municipality || undefined,
        marketLocation: marketLocation || undefined,
        nif: nif || undefined,
        niss: niss || undefined,
      });
      setDossier(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar os dados.';
      setError(message);
    }
  }

  async function handleUploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!docUrl.trim()) return;
    await createDocument(docType, docUrl.trim());
    setDocUrl('');
    fetchMyDocuments().then(setDocuments);
  }

  if (dossier === undefined) return <p className="text-neutral-500">A carregar...</p>;

  if (dossier === null) {
    return (
      <div className="max-w-xl space-y-4">
        <h1 className="text-2xl font-bold text-neutral-900">Formalização</h1>
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não iniciou o processo de formalização.{' '}
          <Link to="/formalizacao/diagnostico" className="font-medium text-xkwanza-600 hover:underline">
            Começar diagnóstico
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Formalização</h1>
        <p className="text-neutral-500">{FORMALIZATION_STATUS_LABELS[dossier.status]}</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-neutral-800">Progresso</span>
          <span className="text-neutral-500">{dossier.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full rounded-full bg-xkwanza-600" style={{ width: `${dossier.progress}%` }} />
        </div>
        {dossier.diagnosis && (
          <p className="mt-3 rounded-md bg-xkwanza-50 p-3 text-sm text-xkwanza-800">{dossier.diagnosis.suggestedNextStep}</p>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 font-semibold text-neutral-900">Etapas</p>
        <ul className="space-y-2">
          {dossier.stages.map((stage) => (
            <li key={stage.id} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-neutral-700">
                {stage.completed ? (
                  <CheckCircle2 size={18} className="text-green-600" />
                ) : (
                  <Circle size={18} className="text-neutral-300" />
                )}
                {stage.name}
              </span>
              {!stage.completed && stage.stageNumber === dossier.currentStage && stage.stageNumber < 6 && (
                <button
                  disabled={isBusy}
                  onClick={() => handleCompleteStage(stage.stageNumber)}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium hover:bg-neutral-50 disabled:opacity-60"
                >
                  Marcar concluída
                </button>
              )}
              {!stage.completed && stage.stageNumber === 6 && dossier.currentStage === 6 && (
                <span className="text-xs text-neutral-400">Aguarda confirmação do suporte</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={handleSaveDossier} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-semibold text-neutral-900">Dados do negócio</p>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome do negócio</label>
          <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Província</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputClass}>
              <option value="">—</option>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Município</label>
            <input value={municipality} onChange={(e) => setMunicipality(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Localização no mercado (opcional)</label>
          <input value={marketLocation} onChange={(e) => setMarketLocation(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">NIF</label>
            <input value={nif} onChange={(e) => setNif(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">NISS</label>
            <input value={niss} onChange={(e) => setNiss(e.target.value)} className={inputClass} />
          </div>
        </div>
        <p className="text-xs text-neutral-400">
          Estes dados são auto-declarados pelo utilizador — a validação oficial só acontece através dos documentos
          submetidos e verificados pelo suporte.
        </p>
        <button type="submit" className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700">
          Guardar
        </button>
      </form>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-semibold text-neutral-900">Documentos</p>

        {documents.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {documents.map((doc) => (
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
            {DOCUMENT_TYPES.map((t) => (
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

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
