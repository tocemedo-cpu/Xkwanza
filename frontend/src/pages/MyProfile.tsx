import { FormEvent, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { requestVerification, updateMyProfile } from '../services/usersService';
import { ANGOLA_PROVINCES } from '../utils/angola';
import { PROFILE_VERIFICATION_STATUS_LABELS } from '../types/user';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function MyProfile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [province, setProvince] = useState(user?.province ?? ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState(user?.municipality ?? '');
  const [locality, setLocality] = useState(user?.locality ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [nif, setNif] = useState(user?.nif ?? '');
  const [notifyByEmail, setNotifyByEmail] = useState(user?.notifyByEmail ?? true);
  const [notifyByPush, setNotifyByPush] = useState(user?.notifyByPush ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);
    try {
      await updateMyProfile({
        name: name.trim() || undefined,
        email: email.trim() || undefined,
        province,
        municipality: municipality.trim() || undefined,
        locality: locality.trim() || undefined,
        avatarUrl: avatarUrl.trim() || undefined,
        nif: nif.trim() || undefined,
        notifyByEmail,
        notifyByPush,
      });
      await refreshUser();
      setSaved(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar o perfil.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRequestVerification() {
    setVerificationError(null);
    setIsRequestingVerification(true);
    try {
      await requestVerification();
      await refreshUser();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (message) {
        // Ex: "já tem um pedido pendente" / "perfil já validado" — apenas sincroniza o
        // estado actual em vez de mostrar um erro, já que a acção do utilizador é inócua.
        await refreshUser();
      } else {
        setVerificationError('Não foi possível pedir a validação do perfil.');
      }
    } finally {
      setIsRequestingVerification(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu perfil</h1>
        <p className="text-neutral-500">Dados pessoais e foto de perfil.</p>
      </div>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <p className="font-medium text-neutral-900">Selo XKWANZA Verificado</p>
        {user.isVerifiedBadge ? (
          <p className="flex items-center gap-1 text-sm font-medium text-xkwanza-600">
            <ShieldCheck size={16} />
            Perfil verificado
          </p>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-neutral-600">
              Estado:{' '}
              <span className="font-medium text-neutral-900">
                {PROFILE_VERIFICATION_STATUS_LABELS[user.verificationStatus ?? 'NONE']}
              </span>
            </p>
            {user.verificationStatus === 'REJECTED' && user.verificationNote && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Motivo da rejeição: {user.verificationNote}
              </p>
            )}
            {verificationError && <p className="text-sm text-red-600">{verificationError}</p>}
            {user.verificationStatus === 'PENDING' ? (
              <button
                type="button"
                disabled
                className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-400"
              >
                Em análise
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRequestVerification}
                disabled={isRequestingVerification}
                className="rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
              >
                {isRequestingVerification
                  ? 'A pedir...'
                  : user.verificationStatus === 'REJECTED'
                    ? 'Pedir validação novamente'
                    : 'Pedir verificação'}
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Província</label>
            <select value={province} onChange={(e) => setProvince(e.target.value)} className={inputClass}>
              {ANGOLA_PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Município</label>
            <input value={municipality} onChange={(e) => setMunicipality(e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Endereço/localidade</label>
          <input value={locality} onChange={(e) => setLocality(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">NIF</label>
          <input value={nif} onChange={(e) => setNif(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Foto de perfil (URL)</label>
          <input
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        <div className="space-y-2 border-t border-neutral-100 pt-4">
          <p className="text-sm font-medium text-neutral-700">Notificações</p>
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
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-xkwanza-600">Perfil actualizado.</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A guardar...' : 'Guardar'}
        </button>
      </form>
    </div>
  );
}
