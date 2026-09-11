import { FormEvent, useEffect, useState } from 'react';
import {
  acceptQuoteProposal,
  createQuoteProposal,
  createQuoteRequest,
  fetchMyQuoteRequests,
  fetchOpenQuotesForSeller,
} from '../services/quotesService';
import { QUOTE_STATUS_LABELS, QuoteRequest } from '../types/quotes';
import { useAuth } from '../hooks/useAuth';
import { formatKwanza } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';
const SELLER_ROLES = ['PRODUCER', 'MERCHANT'];

export function Negociacoes() {
  const { user } = useAuth();
  const isSeller = user ? SELLER_ROLES.includes(user.role) : false;

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [proposalDrafts, setProposalDrafts] = useState<Record<string, { price: string; message: string }>>({});

  function reload() {
    setIsLoading(true);
    const request = isSeller ? fetchOpenQuotesForSeller() : fetchMyQuoteRequests();
    request.then(setQuotes).finally(() => setIsLoading(false));
  }

  useEffect(reload, [isSeller]);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createQuoteRequest({ description, quantity: Number(quantity) });
      setDescription('');
      setQuantity('1');
      setShowForm(false);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar o pedido de cotação.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitProposal(quoteId: string) {
    const draft = proposalDrafts[quoteId];
    if (!draft?.price) return;
    setError(null);
    try {
      await createQuoteProposal(quoteId, { price: Number(draft.price), message: draft.message || undefined });
      setProposalDrafts((prev) => ({ ...prev, [quoteId]: { price: '', message: '' } }));
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível enviar a proposta.';
      setError(message);
    }
  }

  async function handleAccept(quoteId: string, proposalId: string) {
    setError(null);
    try {
      await acceptQuoteProposal(quoteId, proposalId);
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível aceitar a proposta.';
      setError(message);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Negociações</h1>
          <p className="text-neutral-500">
            {isSeller
              ? 'Pedidos de cotação abertos a que pode responder.'
              : 'Peça cotações a produtores e comerciantes e negoceie o melhor preço.'}
          </p>
        </div>
        {!isSeller && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700"
          >
            {showForm ? 'Cancelar' : 'Nova negociação'}
          </button>
        )}
      </div>

      {showForm && !isSeller && (
        <form onSubmit={handleCreate} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">O que precisa?</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o produto/serviço, quantidade e prazo que pretende."
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Quantidade</label>
            <input
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={`${inputClass} w-32`}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A enviar...' : 'Pedir cotação'}
          </button>
        </form>
      )}

      {error && !showForm && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && quotes.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          {isSeller ? 'Sem negociações abertas por agora.' : 'Ainda não pediu nenhuma cotação.'}
        </p>
      )}

      {!isLoading && quotes.length > 0 && (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <div key={quote.id} className="rounded-xl border border-neutral-200 bg-white p-4 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-900">{quote.description}</p>
                  <p className="text-neutral-500">
                    Quantidade: {quote.quantity}
                    {!isSeller && ` · ${quote.requester.name}`}
                    {isSeller && ` · Pedido de ${quote.requester.name}`}
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                  {QUOTE_STATUS_LABELS[quote.status]}
                </span>
              </div>

              {quote.proposals.length > 0 && (
                <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
                  {quote.proposals.map((proposal) => (
                    <div key={proposal.id} className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-neutral-900">
                          {formatKwanza(Number(proposal.price))}
                          {proposal.accepted && <span className="ml-2 text-xs font-medium text-xkwanza-600">Aceite</span>}
                        </p>
                        {proposal.message && <p className="text-neutral-500">{proposal.message}</p>}
                        {isSeller && <p className="text-xs text-neutral-400">{proposal.proposer.name}</p>}
                      </div>
                      {!isSeller && !proposal.accepted && quote.status !== 'ACCEPTED' && (
                        <button
                          onClick={() => handleAccept(quote.id, proposal.id)}
                          className="whitespace-nowrap rounded-md border border-xkwanza-300 px-3 py-1.5 text-xs font-medium text-xkwanza-700 hover:bg-xkwanza-50"
                        >
                          Aceitar
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isSeller && quote.status !== 'ACCEPTED' && quote.status !== 'CANCELLED' && (
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
                  <input
                    type="number"
                    min={1}
                    placeholder="Seu preço (Kz)"
                    value={proposalDrafts[quote.id]?.price ?? ''}
                    onChange={(e) =>
                      setProposalDrafts((prev) => ({
                        ...prev,
                        [quote.id]: { price: e.target.value, message: prev[quote.id]?.message ?? '' },
                      }))
                    }
                    className={`${inputClass} w-32`}
                  />
                  <input
                    type="text"
                    placeholder="Mensagem (opcional)"
                    value={proposalDrafts[quote.id]?.message ?? ''}
                    onChange={(e) =>
                      setProposalDrafts((prev) => ({
                        ...prev,
                        [quote.id]: { price: prev[quote.id]?.price ?? '', message: e.target.value },
                      }))
                    }
                    className={`${inputClass} flex-1`}
                  />
                  <button
                    onClick={() => handleSubmitProposal(quote.id)}
                    className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700"
                  >
                    Propor
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
