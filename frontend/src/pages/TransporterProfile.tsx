import { FormEvent, useEffect, useState } from 'react';
import { fetchMyTransporterProfile, setMyAvailability, upsertMyTransporterProfile } from '../services/transportersService';
import { Transporter } from '../types/logistics';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function TransporterProfile() {
  const [profile, setProfile] = useState<Transporter | null>(null);
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyTransporterProfile()
      .then((data) => {
        setProfile(data);
        if (data) {
          setVehicleType(data.vehicleType ?? '');
          setVehiclePlate(data.vehiclePlate ?? '');
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await upsertMyTransporterProfile({
        vehicleType: vehicleType || undefined,
        vehiclePlate: vehiclePlate || undefined,
      });
      setProfile(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível guardar o perfil.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleAvailability() {
    if (!profile) return;
    const updated = await setMyAvailability(!profile.isAvailable);
    setProfile(updated);
  }

  if (isLoading) return <p className="text-neutral-500">A carregar...</p>;

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Perfil de transportador</h1>
        <p className="text-neutral-500">Dados do veículo e disponibilidade para receber fretes.</p>
      </div>

      {profile && (
        <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-4">
          <div>
            <p className="font-medium text-neutral-900">Disponibilidade</p>
            <p className="text-sm text-neutral-500">
              {profile.isAvailable ? 'Disponível para novos fretes' : 'Indisponível'}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              profile.isAvailable ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'
            }`}
          >
            {profile.isAvailable ? 'Disponível' : 'Indisponível'}
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de veículo</label>
          <input
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            placeholder="Ex: Moto, carrinha, camião"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Matrícula</label>
          <input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className={inputClass} />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

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
