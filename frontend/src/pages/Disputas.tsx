import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createComplaint, fetchMyComplaints } from '../services/complaintsService';
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TARGET_TYPE_LABELS,
  Complaint,
  ComplaintStatus,
  ComplaintTargetType,
} from '../types/complaints';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const TARGET_TYPE_OPTIONS: ComplaintTargetType[] = ['ORDER', 'PRODUCT', 'TRANSPORT_ORDER', 'USER', 'OTHER'];

const STATUS_BADGE_CLASSES: Record<ComplaintStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export function Disputas() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [targetType, setTargetType] = useState<ComplaintTargetType>('OTHER');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    setIsLoading(true);
    fetchMyComplaints()
      .then(setComplaints)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createComplaint({ subject, description, targetType });
      setSubject('');
      setDescription('');
      setTargetType('OTHER');
      setShowForm(false);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar a disputa.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Disputas</h1>
          <p className="text-neutral-500">As tuas disputas com outros utilizadores ou pedidos.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700"
        >
          {showForm ? 'Cancelar' : 'Nova disputa'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Assunto</label>
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Relacionado com</label>
            <select
              value={targetType}
              onChange={(e) => setTargetType(e.target.value as ComplaintTargetType)}
              className={inputClass}
            >
              {TARGET_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {COMPLAINT_TARGET_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Descrição</label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreve a disputa com o máximo de detalhe possível."
              className={inputClass}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A enviar...' : 'Enviar'}
          </button>
        </form>
      )}

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && complaints.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Ainda não abriste nenhuma disputa.
        </p>
      )}

      {!isLoading && complaints.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {complaints.map((complaint) => (
            <Link
              key={complaint.id}
              to={complaint.id}
              className="flex items-center justify-between gap-3 p-4 text-sm hover:bg-neutral-50"
            >
              <div>
                <p className="font-medium text-neutral-900">{complaint.subject}</p>
                <p className="text-neutral-500">
                  Actualizado em {new Date(complaint.updatedAt).toLocaleDateString('pt-PT')}
                </p>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[complaint.status]}`}
              >
                {COMPLAINT_STATUS_LABELS[complaint.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
