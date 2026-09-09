import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { WalletIcon } from 'lucide-react';
import { fetchMyWallet } from '../services/walletService';
import { Wallet as WalletType } from '../types/payments';
import { formatKwanza } from '../utils/angola';

export function Wallet() {
  const [wallet, setWallet] = useState<WalletType | null>(null);

  useEffect(() => {
    fetchMyWallet().then(setWallet);
  }, []);

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Minha carteira</h1>
        <p className="text-neutral-500">Saldo das vendas concluídas na XKWANZA.</p>
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-2 flex items-center gap-2 text-xkwanza-600">
          <WalletIcon size={18} />
          <h2 className="font-semibold text-neutral-900">Saldo disponível</h2>
        </div>
        <p className="text-3xl font-bold text-neutral-900">{wallet ? formatKwanza(Number(wallet.balance)) : '—'}</p>
        <p className="mt-2 text-sm text-neutral-500">
          O saldo é creditado quando o comprador confirma a recepção de uma encomenda (custódia XKWANZA Protect).
          Para levantamentos, registe uma conta bancária e contacte o suporte — ainda não existe integração
          bancária automática.
        </p>
        <Link to="/contas-bancarias" className="mt-3 inline-block text-sm font-medium text-xkwanza-600 hover:underline">
          Gerir contas bancárias →
        </Link>
      </div>
    </div>
  );
}
