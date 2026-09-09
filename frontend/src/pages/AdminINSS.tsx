import { useEffect, useState } from 'react';
import { fetchPendingDocuments, rejectDocument, verifyDocument } from '../services/inssService';
import { INSSDocument } from '../types/inss';
import { DOCUMENT_TYPE_LABELS } from '../types/formalization';

export function AdminINSS() {
  const [documents, setDocuments] = useState<INSSDocument[]>([]);
  const [error, setError] = useState<string | null>(null);

  function reload() {
    fetchPendingDocuments().then(setDocuments);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">INSS — documentos pendentes</h1>
        <p className="text-neutral-500">
          Confirma apenas a legibilidade/completude do documento submetido — não representa uma decisão do INSS.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

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
                  {doc.linkage?.user.name} ({doc.linkage?.user.phone})
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
  );
}
