import { FormEvent, useEffect, useState } from 'react';
import { fetchMyTransporterProfile, setMyAvailability, upsertMyTransporterProfile } from '../services/transportersService';
import { createDocument, fetchMyDocuments } from '../services/formalizationService';
import { Transporter, TRANSPORTER_CATEGORY_LABELS, TransporterCategory } from '../types/logistics';
import { DOCUMENT_STATUS_LABELS, DOCUMENT_TYPE_LABELS, DocumentType, FormalizationDocument } from '../types/formalization';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

// Documentação relevante para o transportador — os restantes tipos de Document (ex: IDENTITY
// da formalização) partilham o mesmo endpoint mas não aparecem aqui.
const TRANSPORTER_DOCUMENT_TYPES: DocumentType[] = ['VEHICLE_DOCUMENT', 'SERVICE_REQUIREMENT'];

export function TransporterProfile() {
  const [profile, setProfile] = useState<Transporter | null>(null);
  const [transporterCategory, setTransporterCategory] = useState<TransporterCategory | ''>('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [cargoCapacity, setCargoCapacity] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [serviceAreasText, setServiceAreasText] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [documents, setDocuments] = useState<FormalizationDocument[]>([]);
  const [docType, setDocType] = useState<DocumentType>('VEHICLE_DOCUMENT');
  const [docUrl, setDocUrl] = useState('');

  useEffect(() => {
    fetchMyTransporterProfile()
      .then((data) => {
        setProfile(data);
        if (data) {
          setTransporterCategory(data.transporterCategory ?? '');
          setVehicleType(data.vehicleType ?? '');
          setVehiclePlate(data.vehiclePlate ?? '');
          setCargoCapacity(data.cargoCapacity ?? '');
          setCargoType(data.cargoType ?? '');
          setServiceAreasText(data.serviceAreas.join(', '));
          setServicePrice(data.servicePrice ?? '');
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
      const updated = await upsertMyTransporterProfile({
        transporterCategory: transporterCategory || undefined,
        vehicleType: vehicleType || undefined,
        vehiclePlate: vehiclePlate || undefined,
        cargoCapacity: cargoCapacity || undefined,
        cargoType: cargoType || undefined,
        serviceAreas: serviceAreasText.trim()
          ? serviceAreasText.split(',').map((a) => a.trim()).filter(Boolean)
          : undefined,
        servicePrice: servicePrice || undefined,
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

  async function handleToggleAvailability() {
    if (!profile) return;
    const updated = await setMyAvailability(!profile.isAvailable);
    setProfile(updated);
  }

  async function handleUploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!docUrl.trim()) return;
    await createDocument(docType, docUrl.trim());
    setDocUrl('');
    fetchMyDocuments().then(setDocuments);
  }

  if (isLoading) return <p className="text-neutral-500">A carregar...</p>;

  const transporterDocuments = documents.filter((doc) => TRANSPORTER_DOCUMENT_TYPES.includes(doc.type));

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil de transportador</h1>
        <p className="text-neutral-500">Dados do transporte, documentação e disponibilidade para receber fretes.</p>
      </div>

      {profile && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
          <div>
            <p className="font-medium text-neutral-900">Disponibilidade</p>
            <p className="text-sm text-neutral-500">
              {profile.isAvailable ? 'Disponível para novos fretes' : 'Indisponível'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              profile.isAvailable ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {profile.isAvailable ? 'Disponível' : 'Indisponível'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Dados do transporte</p>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de transportador</label>
          <select
            value={transporterCategory}
            onChange={(e) => setTransporterCategory(e.target.value as TransporterCategory | '')}
            className={inputClass}
          >
            <option value="">Prefiro não indicar</option>
            {(Object.keys(TRANSPORTER_CATEGORY_LABELS) as TransporterCategory[]).map((c) => (
              <option key={c} value={c}>
                {TRANSPORTER_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de veículo</label>
          <input
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            placeholder="Ex: Moto, carrinha, camião"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Matrícula</label>
          <input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Capacidade de carga</label>
          <input
            value={cargoCapacity}
            onChange={(e) => setCargoCapacity(e.target.value)}
            placeholder="Ex: 500 kg"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de mercadoria transportada</label>
          <input
            value={cargoType}
            onChange={(e) => setCargoType(e.target.value)}
            placeholder="Ex: Produtos agrícolas"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Municípios/províncias atendidos</label>
          <input
            value={serviceAreasText}
            onChange={(e) => setServiceAreasText(e.target.value)}
            placeholder="Ex: Luanda, Belas, Viana"
            className={inputClass}
          />
          <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Preço do serviço</label>
          <input
            value={servicePrice}
            onChange={(e) => setServicePrice(e.target.value)}
            placeholder="Ex: 5000 Kz por viagem"
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
            Opcional — documentos do veículo e documentação exigida para o serviço. Podes começar a receber fretes
            sem os submeter e adicioná-los depois.
          </p>
        </div>

        {transporterDocuments.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {transporterDocuments.map((doc) => (
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
            {TRANSPORTER_DOCUMENT_TYPES.map((t) => (
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
