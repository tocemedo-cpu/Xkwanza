import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { addComplaintMessage, fetchComplaint, updateComplaintStatus } from '../services/complaintsService';
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TARGET_TYPE_LABELS,
  Complaint,
  ComplaintStatus,
} from '../types/complaints';
import { getRolePrefix } from '../types/user';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const STAFF_ROLES = ['ADMIN', 'SUPPORT'];
const STATUS_OPTIONS: ComplaintStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'];

const STATUS_BADGE_CLASSES: Record<ComplaintStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-700',
  UNDER_REVIEW: 'bg-blue-100 text-blue-700',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
};

export function DisputaDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [statusDraft, setStatusDraft] = useState<ComplaintStatus>('OPEN');
  const [resolutionNote, setResolutionNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  function reload() {
    if (!id) return;
    fetchComplaint(id)
      .then((data) => {
        setComplaint(data);
        setStatusDraft(data.status);
        setResolutionNote(data.resolutionNote ?? '');
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, [id]);

  const isStaff = Boolean(user && STAFF_ROLES.includes(user.role));

  async function handleReply(event: FormEvent) {
    event.preventDefault();
    if (!id || !reply.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await addComplaintMessage(id, reply.trim());
      setComplaint(updated);
      setReply('');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a mensagem.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const requiresResolutionNote = statusDraft === 'RESOLVED' || statusDraft === 'REJECTED';
  const canSubmitStatus = !requiresResolutionNote || resolutionNote.trim().length > 0;

  async function handleStatusSubmit(event: FormEvent) {
    event.preventDefault();
    if (!id || !canSubmitStatus) return;
    setStatusError(null);
    setIsUpdatingStatus(true);
    try {
      const updated = await updateComplaintStatus(id, statusDraft, resolutionNote.trim() || undefined);
      setComplaint(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível actualizar o estado.';
      setStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) return <p className="text-neutral-500">A carregar...</p>;
  if (!complaint) return <p className="text-neutral-500">Disputa não encontrada.</p>;

  const isClosed = complaint.status === 'RESOLVED' || complaint.status === 'REJECTED';
  const backTo = isStaff ? '/admin/disputas' : user ? `/${getRolePrefix(user.role)}/disputas` : '/entrar';

  return (
    <div className="max-w-2xl space-y-6">
      <Link to={backTo} className="flex items-center gap-1 text-sm text-neutral-500 hover:text-xkwanza-600">
        <ArrowLeft size={14} />
        Voltar às disputas
      </Link>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">{complaint.subject}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Aberta por {complaint.complainant.name}
              {complaint.agent && ` · Atribuída a ${complaint.agent.name}`}
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              {COMPLAINT_TARGET_TYPE_LABELS[complaint.targetType]}
              {complaint.targetId && ` · ${complaint.targetId}`}
            </p>
          </div>
          <span
            className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASSES[complaint.status]}`}
          >
            {COMPLAINT_STATUS_LABELS[complaint.status]}
          </span>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm text-neutral-700">{complaint.description}</p>

        {complaint.resolutionNote && (
          <div className="mt-4 rounded-lg bg-neutral-50 p-3 text-sm">
            <p className="font-medium text-neutral-900">Nota de resolução</p>
            <p className="mt-1 whitespace-pre-wrap text-neutral-700">{complaint.resolutionNote}</p>
          </div>
        )}

        {isStaff && (
          <form onSubmit={handleStatusSubmit} className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-neutral-500">Estado:</label>
              <select
                value={statusDraft}
                onChange={(e) => setStatusDraft(e.target.value as ComplaintStatus)}
                className="rounded-md border border-neutral-300 px-2 py-1 text-xs focus:border-xkwanza-500 focus:outline-none"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {COMPLAINT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            {requiresResolutionNote && (
              <div>
                <label className="mb-1 block text-xs font-medium text-neutral-500">
                  Nota de resolução (obrigatória)
                </label>
                <textarea
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Explica a decisão tomada sobre esta disputa."
                  className={inputClass}
                />
              </div>
            )}
            {statusError && <p className="text-sm text-red-600">{statusError}</p>}
            <button
              type="submit"
              disabled={isUpdatingStatus || !canSubmitStatus}
              className="rounded-md bg-neutral-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-900 disabled:opacity-60"
            >
              {isUpdatingStatus ? 'A actualizar...' : 'Actualizar estado'}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Mensagens</p>

        {complaint.messages.length === 0 && <p className="text-sm text-neutral-500">Ainda sem respostas.</p>}

        <ul className="space-y-3">
          {complaint.messages.map((message) => (
            <li key={message.id} className="rounded-lg bg-neutral-50 p-3 text-sm">
              <p className="font-medium text-neutral-900">
                {message.author.name}
                {message.authorId === complaint.complainant.id ? '' : ' · equipa XKWANZA'}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-neutral-700">{message.body}</p>
              <p className="mt-1 text-xs text-neutral-400">{new Date(message.createdAt).toLocaleString('pt-PT')}</p>
            </li>
          ))}
        </ul>

        {isClosed ? (
          <p className="text-sm text-neutral-500">Disputa encerrada.</p>
        ) : (
          <form onSubmit={handleReply} className="flex gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Escreve uma mensagem..."
              className={inputClass}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="shrink-0 rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
            >
              Enviar
            </button>
          </form>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
