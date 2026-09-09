import { ShieldCheck, TrendingUp, FileCheck2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ROLE_LABELS, TrustLevel } from '../types/user';

const TRUST_LEVEL_LABELS: Record<TrustLevel, string> = {
  LEVEL_1_CONTACT_VALIDATED: 'Nível 1 — Contacto validado',
  LEVEL_2_IDENTITY_VALIDATED: 'Nível 2 — Identidade validada',
  LEVEL_3_ACTIVITY_VALIDATED: 'Nível 3 — Actividade económica validada',
  LEVEL_4_DOCUMENTS_VALIDATED: 'Nível 4 — Documentos validados',
  LEVEL_5_FORMALIZATION_VALIDATED: 'Nível 5 — Formalização validada',
};

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Olá, {user.name.split(' ')[0]}</h1>
        <p className="text-neutral-500">
          {ROLE_LABELS[user.role]} · {user.municipality}, {user.province}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
            <TrendingUp size={18} />
            <h2 className="font-semibold text-neutral-900">Minha actividade</h2>
          </div>
          <p className="text-sm text-neutral-500">
            Vendas, compras, rendimento, pedidos e entregas ficarão disponíveis à medida que o marketplace for
            activado (Fase 2).
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
            <FileCheck2 size={18} />
            <h2 className="font-semibold text-neutral-900">Minha formalização</h2>
          </div>
          <p className="text-sm text-neutral-500">
            Diagnóstico, dossiê, documentos e índice de formalização serão activados na Fase 6.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
            <ShieldCheck size={18} />
            <h2 className="font-semibold text-neutral-900">Meu nível XKWANZA</h2>
          </div>
          <p className="text-sm font-medium text-neutral-800">{TRUST_LEVEL_LABELS[user.trustLevel]}</p>
          <p className="mt-1 text-sm text-neutral-500">
            {user.isVerifiedBadge ? 'Selo XKWANZA Verificado activo.' : 'Ainda sem o Selo XKWANZA Verificado.'}
          </p>
        </div>
      </div>
    </div>
  );
}
