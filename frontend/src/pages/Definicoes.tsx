import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { requestPasswordReset } from '../services/authService';
import { updateMyProfile } from '../services/usersService';
import { getRolePrefix } from '../types/user';

export function Definicoes() {
  const { user, refreshUser } = useAuth();
  const [notifyByEmail, setNotifyByEmail] = useState(user?.notifyByEmail ?? true);
  const [notifyByPush, setNotifyByPush] = useState(user?.notifyByPush ?? true);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!user) return null;

  async function handleSavePreferences() {
    setIsSavingPrefs(true);
    setPrefsSaved(false);
    try {
      await updateMyProfile({ notifyByEmail, notifyByPush });
      await refreshUser();
      setPrefsSaved(true);
    } finally {
      setIsSavingPrefs(false);
    }
  }

  async function handleRequestPasswordReset() {
    if (!user) return;
    setIsSendingReset(true);
    setResetSent(false);
    try {
      await requestPasswordReset(user.email ?? user.phone ?? '');
      setResetSent(true);
    } finally {
      setIsSendingReset(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Definições</h1>
        <p className="text-neutral-500">Segurança, palavra-passe e preferências.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Segurança</p>
        <p className="text-sm text-neutral-600">
          Envie um link de redefinição de palavra-passe para o seu email/telefone associado.
        </p>
        <button
          onClick={handleRequestPasswordReset}
          disabled={isSendingReset}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {isSendingReset ? 'A enviar...' : 'Redefinir palavra-passe'}
        </button>
        {resetSent && (
          <p className="text-sm text-xkwanza-600">Se a conta existir, foi enviado um link de redefinição.</p>
        )}
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-semibold text-neutral-900">Preferências de notificação</p>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={notifyByEmail}
            onChange={(e) => setNotifyByEmail(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-xkwanza-600 focus:ring-xkwanza-500"
          />
          Receber notificações por email
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={notifyByPush}
            onChange={(e) => setNotifyByPush(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-xkwanza-600 focus:ring-xkwanza-500"
          />
          Receber notificações push
        </label>
        <button
          onClick={handleSavePreferences}
          disabled={isSavingPrefs}
          className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSavingPrefs ? 'A guardar...' : 'Guardar preferências'}
        </button>
        {prefsSaved && <p className="text-sm text-xkwanza-600">Preferências actualizadas.</p>}
      </div>

      {user.role !== 'BUYER' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6">
          <p className="mb-1 font-semibold text-neutral-900">Pagamentos</p>
          <p className="mb-3 text-sm text-neutral-600">
            Contas bancárias usadas para receber os pagamentos confirmados dos seus pedidos.
          </p>
          <Link
            to={`/${getRolePrefix(user.role)}/contas-bancarias`}
            className="text-sm font-medium text-xkwanza-600 hover:underline"
          >
            Gerir contas bancárias →
          </Link>
        </div>
      )}
    </div>
  );
}
