import { useEffect, useState } from 'react';
import { fetchQuotesForAdmin } from '../services/quotesService';
import { QUOTE_STATUS_LABELS, QuoteRequest } from '../types/quotes';
import { PaginatedResult } from '../types/marketplace';

export function AdminQuotes() {
  const [result, setResult] = useState<PaginatedResult<QuoteRequest> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuotesForAdmin(1, 50)
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Negociações</h1>
        <p className="text-neutral-500">Todos os pedidos de cotação da plataforma.</p>
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhuma negociação registada.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((quote) => (
            <div key={quote.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{quote.description}</p>
                <p className="text-neutral-500">
                  {quote.requester.name} · Quantidade: {quote.quantity} · {quote.proposals.length} proposta(s)
                </p>
              </div>
              <span className="whitespace-nowrap rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                {QUOTE_STATUS_LABELS[quote.status]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
