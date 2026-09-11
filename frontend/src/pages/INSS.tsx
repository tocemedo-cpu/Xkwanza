import { FormEvent, useEffect, useState } from 'react';
import {
  createDocument,
  createSimulation,
  fetchMyLinkage,
  grantConsent,
  revokeConsent,
  submitLinkage,
  syncStatus,
  updateNiss,
} from '../services/inssService';
import { INSS_STATUS_LABELS, INSSLinkage } from '../types/inss';
import { DOCUMENT_TYPE_LABELS, DocumentType } from '../types/formalization';
import { formatKwanza } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const CONSENT_PURPOSE = 'Preparar e acompanhar a minha ligação ao INSS através da XKWANZA';
const AUTHORIZED_DATA = ['Nome', 'Telefone', 'Actividade económica', 'Histórico de vendas na XKWANZA'];

export function INSS() {
  const [linkage, setLinkage] = useState<INSSLinkage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [niss, setNiss] = useState('');
  const [docType, setDocType] = useState<DocumentType>('IDENTITY');
  const [docUrl, setDocUrl] = useState('');

  const [declaredBase, setDeclaredBase] = useState('');
  const [contributionRate, setContributionRate] = useState('');
  const [regime, setRegime] = useState('Trabalhador por conta própria');
  const [simulationResult, setSimulationResult] = useState<{ monthly: number; annual: number } | null>(null);

  function reload() {
    fetchMyLinkage().then((data) => {
      setLinkage(data);
      setNiss(data.niss ?? '');
    });
  }

  useEffect(reload, []);

  async function runAction(action: () => Promise<INSSLinkage>) {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await action();
      setLinkage(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível concluir a acção.';
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSaveNiss(event: FormEvent) {
    event.preventDefault();
    if (!niss.trim()) return;
    await runAction(() => updateNiss(niss.trim()));
  }

  async function handleUploadDocument(event: FormEvent) {
    event.preventDefault();
    if (!docUrl.trim()) return;
    await createDocument(docType, docUrl.trim());
    setDocUrl('');
    reload();
  }

  async function handleSimulate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const result = await createSimulation({
        declaredBase: Number(declaredBase),
        contributionRate: Number(contributionRate),
        regime,
      });
      setSimulationResult({ monthly: Number(result.monthlyContribution), annual: Number(result.annualContribution) });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível simular.';
      setError(message);
    }
  }

  if (!linkage) return <p className="text-neutral-500">A carregar...</p>;

  const hasActiveConsent = linkage.consents.some((c) => !c.revokedAt);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">INSS</h1>
        <p className="text-neutral-500">
          Esta secção é apenas uma preparação e acompanhamento não-oficial — a XKWANZA não é o INSS nem substitui os
          seus canais oficiais.
        </p>
      </div>

      <div className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-gold-800">
        Modo <strong>SANDBOX</strong> — sem integração institucional real. Os estados e simulações aqui apresentados
        são apenas de preparação/teste.
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-1 font-semibold text-neutral-900">Estado da ligação</p>
        <p className="text-neutral-700">{INSS_STATUS_LABELS[linkage.status]}</p>
        {linkage.niss && <p className="mt-1 text-sm text-neutral-500">NISS registado: {linkage.niss}</p>}
      </div>

      {!hasActiveConsent ? (
        <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="font-semibold text-neutral-900">Consentimento</p>
          <p className="text-sm text-neutral-600">
            Para preparar a sua ligação ao INSS, autorize a XKWANZA a usar os seguintes dados: {AUTHORIZED_DATA.join(', ')}.
          </p>
          <button
            disabled={isBusy}
            onClick={() => runAction(() => grantConsent({ purpose: CONSENT_PURPOSE, authorizedData: AUTHORIZED_DATA }))}
            className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            Conceder consentimento
          </button>
        </div>
      ) : (
        <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="font-semibold text-neutral-900">Consentimento activo</p>
          {linkage.consents
            .filter((c) => !c.revokedAt)
            .map((c) => (
              <div key={c.id} className="flex items-center justify-between text-sm">
                <span className="text-neutral-600">{c.purpose}</span>
                <button
                  disabled={isBusy}
                  onClick={() => runAction(() => revokeConsent(c.id))}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
                  Revogar
                </button>
              </div>
            ))}

          {linkage.status === 'READY' && (
            <button
              disabled={isBusy}
              onClick={() => runAction(submitLinkage)}
              className="mt-2 rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
            >
              Submeter ligação (sandbox)
            </button>
          )}
          {(linkage.status === 'SUBMITTED' || linkage.status === 'INSS_PENDING') && (
            <button
              disabled={isBusy}
              onClick={() => runAction(syncStatus)}
              className="mt-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
            >
              Sincronizar estado (sandbox)
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSaveNiss} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-semibold text-neutral-900">Já tem NISS?</p>
        <p className="text-sm text-neutral-500">
          Se já possui um Número de Identificação da Segurança Social obtido junto do INSS, registe-o aqui — nunca é
          gerado pela XKWANZA.
        </p>
        <div className="flex gap-2">
          <input value={niss} onChange={(e) => setNiss(e.target.value)} className={inputClass} placeholder="NISS" />
          <button type="submit" className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50">
            Guardar
          </button>
        </div>
      </form>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-semibold text-neutral-900">Documentos</p>
        {linkage.documents.length > 0 && (
          <ul className="divide-y divide-neutral-100">
            {linkage.documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-neutral-700">{DOCUMENT_TYPE_LABELS[doc.type]}</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">{doc.status}</span>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={handleUploadDocument} className="flex gap-2">
          <select value={docType} onChange={(e) => setDocType(e.target.value as DocumentType)} className={inputClass}>
            {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((t) => (
              <option key={t} value={t}>
                {DOCUMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <input value={docUrl} onChange={(e) => setDocUrl(e.target.value)} placeholder="https://..." className={inputClass} />
          <button type="submit" className="shrink-0 rounded-md border border-neutral-300 px-3 py-2 text-sm font-medium hover:bg-neutral-50">
            Adicionar
          </button>
        </form>
      </div>

      <form onSubmit={handleSimulate} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="font-semibold text-neutral-900">Simulador de contribuição</p>
        <p className="rounded-md bg-red-50 p-2 text-xs font-medium text-red-700">
          SIMULAÇÃO — NÃO É UMA GUIA DE PAGAMENTO. Confirme a taxa de contribuição em vigor junto do INSS antes de
          decidir; a XKWANZA não define nem garante taxas oficiais.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Base declarada (Kz/mês)</label>
            <input
              required
              type="number"
              min={0}
              value={declaredBase}
              onChange={(e) => setDeclaredBase(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Taxa de contribuição (%)</label>
            <input
              required
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={contributionRate}
              onChange={(e) => setContributionRate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Regime</label>
          <input value={regime} onChange={(e) => setRegime(e.target.value)} className={inputClass} />
        </div>
        <button type="submit" className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700">
          Simular
        </button>
        {simulationResult && (
          <div className="rounded-md bg-neutral-50 p-3 text-sm text-neutral-700">
            <p>Contribuição mensal estimada: <strong>{formatKwanza(simulationResult.monthly)}</strong></p>
            <p>Contribuição anual estimada: <strong>{formatKwanza(simulationResult.annual)}</strong></p>
          </div>
        )}
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
