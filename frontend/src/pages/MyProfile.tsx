import { FormEvent, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateMyProfile } from '../services/usersService';
import { ANGOLA_PROVINCES } from '../utils/angola';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Meu perfil</h1>
        <p className="text-neutral-500">Dados pessoais e foto de perfil.</p>
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

        {error && <p className="text-sm text-red-600">{error}</p>}
        {saved && <p className="text-sm text-green-700">Perfil actualizado.</p>}

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
