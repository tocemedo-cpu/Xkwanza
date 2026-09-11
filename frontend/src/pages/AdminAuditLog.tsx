import { useEffect, useState } from 'react';
import { fetchAuditLogs } from '../services/auditService';
import { AuditLog } from '../types/audit';
import { PaginatedResult } from '../types/marketplace';

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function AdminAuditLog() {
  const [entity, setEntity] = useState('');
  const [action, setAction] = useState('');
  const [result, setResult] = useState<PaginatedResult<AuditLog> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetchAuditLogs({ entity: entity || undefined, action: action || undefined, pageSize: 50 })
      .then(setResult)
      .finally(() => setIsLoading(false));
  }, [entity, action]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Auditoria</h1>
        <p className="text-neutral-500">Registo de eventos críticos da plataforma — só de leitura.</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={entity} onChange={(e) => setEntity(e.target.value)} placeholder="Entidade (ex: User, Order)" className={inputClass} />
        <input value={action} onChange={(e) => setAction(e.target.value)} placeholder="Acção (ex: USER_SUSPENDED)" className={inputClass} />
      </div>

      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && result && result.items.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhum evento encontrado.
        </p>
      )}

      {!isLoading && result && result.items.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {result.items.map((log) => (
            <div key={log.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">
                  {log.action} <span className="text-neutral-400">· {log.entity}</span>
                </p>
                <p className="text-neutral-500">
                  {log.user?.name ?? 'Sistema'} · {new Date(log.createdAt).toLocaleString('pt-PT')}
                </p>
              </div>
              <span
                className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                  log.result === 'SUCCESS' ? 'bg-xkwanza-100 text-xkwanza-600' : 'bg-red-100 text-red-700'
                }`}
              >
                {log.result === 'SUCCESS' ? 'Sucesso' : 'Falha'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
