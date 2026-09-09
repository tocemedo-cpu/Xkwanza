import { useEffect, useState } from 'react';
import {
  fetchDossiersReadyToFinalize,
  fetchPendingDocuments,
  finalizeDossier,
  rejectDocument,
  verifyDocument,
} from '../services/formalizationService';
import { DOCUMENT_TYPE_LABELS, DossierReadyToFinalize, FormalizationDocument } from '../types/formalization';

export function AdminFormalization() {
  const [documents, setDocuments] = useState<FormalizationDocument[]>([]);
  const [dossiers, setDossiers] = useState<DossierReadyToFinalize[]>([]);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    fetchPendingDocuments().then(setDocuments);
    fetchDossiersReadyToFinalize().then(setDossiers);
  }

  useEffect(reload, []);

  async function handleVerify(id: string) {
    setError(null);
    try {
      await verifyDocument(id);
      reload();
    } catch {
      setError('Não foi possível verificar o documento.');
    }
  }

  async function handleReject(id: string) {
    setError(null);
    try {
      await rejectDocument(id);
      reload();
    } catch {
      setError('Não foi possível rejeitar o documento.');
    }
  }

  async function handleFinalize(userId: string) {
    setError(null);
    try {
      await finalizeDossier(userId);
      reload();
    } catch {
      setError('Não foi possível concluir a formalização.');
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Formalização — verificação</h1>
        <p className="text-neutral-500">
          Confirme os documentos e conclua dossiês apenas depois de uma verificação real — nunca automaticamente.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Documentos pendentes</h2>
        {documents.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Sem documentos pendentes.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <p className="font-medium text-neutral-900">
                    {doc.owner?.name} ({doc.owner?.phone})
                  </p>
                  <p className="text-neutral-500">
                    {DOCUMENT_TYPE_LABELS[doc.type]} ·{' '}
                    <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-xkwanza-600 hover:underline">
                      ver ficheiro
                    </a>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(doc.id)}
                    className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700"
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => handleReject(doc.id)}
                    className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-neutral-900">Dossiês prontos para conclusão</h2>
        {dossiers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            Nenhum dossiê à espera de conclusão.
          </p>
        ) : (
          <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
            {dossiers.map((dossier) => (
              <div key={dossier.id} className="flex items-center justify-between p-4 text-sm">
                <p className="font-medium text-neutral-900">
                  {dossier.user.name} ({dossier.user.phone})
                </p>
                <button
                  onClick={() => handleFinalize(dossier.userId)}
                  className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700"
                >
                  Concluir formalização
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
