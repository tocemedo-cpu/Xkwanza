import { FormEvent, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { createBankAccount, deleteBankAccount, fetchMyBankAccounts } from '../services/bankAccountsService';
import { BankAccount } from '../types/payments';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function BankAccounts() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [bankName, setBankName] = useState('');
  const [iban, setIban] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [error, setError] = useState<string | null>(null);

  function reload() {
    fetchMyBankAccounts().then(setAccounts);
  }

  useEffect(reload, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      await createBankAccount({ bankName, iban: iban || undefined, accountHolder, isDefault: accounts.length === 0 });
      setBankName('');
      setIban('');
      setAccountHolder('');
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível adicionar a conta bancária.';
      setError(message);
    }
  }

  async function handleDelete(id: string) {
    await deleteBankAccount(id);
    reload();
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Contas bancárias</h1>
        <p className="text-neutral-500">Usadas como referência para levantamentos do saldo da carteira.</p>
      </div>

      {accounts.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {accounts.map((account) => (
            <div key={account.id} className="flex items-center justify-between p-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{account.bankName}</p>
                <p className="text-neutral-500">
                  {account.accountHolder}
                  {account.iban && ` · ${account.iban}`}
                </p>
              </div>
              <button onClick={() => handleDelete(account.id)} className="text-neutral-400 hover:text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold text-neutral-900">Adicionar conta</h2>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Banco</label>
          <input required value={bankName} onChange={(e) => setBankName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Titular</label>
          <input
            required
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">IBAN (opcional)</label>
          <input value={iban} onChange={(e) => setIban(e.target.value)} className={inputClass} />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700"
        >
          Adicionar
        </button>
      </form>
    </div>
  );
}
