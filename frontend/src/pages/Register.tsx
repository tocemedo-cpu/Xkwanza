import { FormEvent, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../hooks/useAuth';
import { ANGOLA_PHONE_PREFIX, ANGOLA_PROVINCES } from '../utils/angola';
import {
  ACTIVITY_TYPE_LABELS,
  ACTIVITY_TYPES_BY_ROLE,
  ActivityType,
  ROLE_LABELS,
  SELF_REGISTRABLE_ROLES,
  UserRole,
} from '../types/user';
import { TRANSPORTER_CATEGORY_LABELS, TransporterCategory } from '../types/logistics';
import { IdentifierMethod, IdentifierMethodToggle } from '../components/IdentifierMethodToggle';

// Roles cujo cadastro mostra o campo de NIF — sempre opcional, nunca bloqueia informais.
const NIF_ROLES: UserRole[] = ['PRODUCER', 'MERCHANT', 'TRANSPORTER'];

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

// A rota usa o perfil em minúsculas (/registar/produtor não existe — usamos os valores do
// enum em minúsculas, ex: /registar/producer) para manter a correspondência directa com
// UserRole sem mapear nomes diferentes em dois sítios.
function roleFromParam(param: string | undefined): UserRole | null {
  const upper = param?.toUpperCase();
  return SELF_REGISTRABLE_ROLES.includes(upper as UserRole) ? (upper as UserRole) : null;
}

export function Register() {
  const { role: roleParam } = useParams<{ role: string }>();
  const role = roleFromParam(roleParam);

  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [method, setMethod] = useState<IdentifierMethod>('phone');
  const [phone, setPhone] = useState(ANGOLA_PHONE_PREFIX);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [province, setProvince] = useState<string>(ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState('');
  const [activityType, setActivityType] = useState<ActivityType | ''>('');
  const [nif, setNif] = useState('');
  const [transporterCategory, setTransporterCategory] = useState<TransporterCategory | ''>('');
  const [vehicleType, setVehicleType] = useState('');
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [cargoCapacity, setCargoCapacity] = useState('');
  const [cargoType, setCargoType] = useState('');
  const [serviceAreasText, setServiceAreasText] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!role) {
    return <Navigate to="/registar" replace />;
  }

  const activityOptions = ACTIVITY_TYPES_BY_ROLE[role];

  function handleMethodChange(next: IdentifierMethod) {
    setMethod(next);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        name,
        phone: method === 'phone' ? phone : undefined,
        email: method === 'email' ? email : undefined,
        password,
        province,
        municipality,
        role: role as UserRole,
        activityType: activityType || undefined,
        nif: nif.trim() || undefined,
        ...(role === 'TRANSPORTER' && {
          transporterCategory: transporterCategory || undefined,
          vehicleType: vehicleType.trim() || undefined,
          vehiclePlate: vehiclePlate.trim() || undefined,
          cargoCapacity: cargoCapacity.trim() || undefined,
          cargoType: cargoType.trim() || undefined,
          serviceAreas: serviceAreasText.trim()
            ? serviceAreasText
                .split(',')
                .map((area) => area.trim())
                .filter(Boolean)
            : undefined,
          servicePrice: servicePrice.trim() || undefined,
        }),
      });
      navigate('/painel');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível criar a conta. Verifique os dados.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout title={`Criar conta — ${ROLE_LABELS[role]}`} subtitle="Comece a comprar ou vender no XKWANZA">
      <Link
        to="/registar"
        className="mb-4 flex items-center gap-1 text-sm text-neutral-500 hover:text-xkwanza-600"
      >
        <ArrowLeft size={14} />
        Escolher outro perfil
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Nome completo</label>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Como queres entrar na conta?</label>
          <IdentifierMethodToggle value={method} onChange={handleMethodChange} />
        </div>

        {method === 'phone' ? (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Telefone</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
              placeholder="+244900000000"
            />
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="tu@exemplo.com"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Palavra-passe</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
          />
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
            <input
              required
              value={municipality}
              onChange={(e) => setMunicipality(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {activityOptions && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              Tipo de actividade <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value as ActivityType | '')}
              className={inputClass}
            >
              <option value="">Prefiro não indicar</option>
              {activityOptions.map((a) => (
                <option key={a} value={a}>
                  {ACTIVITY_TYPE_LABELS[a]}
                </option>
              ))}
            </select>
          </div>
        )}

        {NIF_ROLES.includes(role) && (
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">
              NIF <span className="font-normal text-neutral-400">(opcional)</span>
            </label>
            <input
              value={nif}
              onChange={(e) => setNif(e.target.value)}
              className={inputClass}
              placeholder="Deixa em branco se ainda não tiveres NIF"
            />
            <p className="mt-1 text-xs text-neutral-500">
              Não é obrigatório — podes começar a{' '}
              {role === 'TRANSPORTER' ? 'transportar' : 'vender'} sem NIF e regularizar mais tarde em "Formalização".
            </p>
          </div>
        )}

        {role === 'TRANSPORTER' && (
          <div className="space-y-4 rounded-lg border border-neutral-200 p-4">
            <div>
              <p className="font-medium text-neutral-900">Dados do transporte</p>
              <p className="text-xs text-neutral-500">
                Todos opcionais — podes começar a receber fretes e completar isto mais tarde em "Meu perfil de
                transportador".
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de transportador</label>
              <select
                value={transporterCategory}
                onChange={(e) => setTransporterCategory(e.target.value as TransporterCategory | '')}
                className={inputClass}
              >
                <option value="">Prefiro não indicar</option>
                {(Object.keys(TRANSPORTER_CATEGORY_LABELS) as TransporterCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {TRANSPORTER_CATEGORY_LABELS[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
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
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Capacidade de carga</label>
                <input
                  value={cargoCapacity}
                  onChange={(e) => setCargoCapacity(e.target.value)}
                  placeholder="Ex: 500 kg"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-neutral-700">Tipo de mercadoria</label>
                <input
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  placeholder="Ex: Produtos agrícolas"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Municípios/províncias atendidos</label>
              <input
                value={serviceAreasText}
                onChange={(e) => setServiceAreasText(e.target.value)}
                placeholder="Ex: Luanda, Belas, Viana"
                className={inputClass}
              />
              <p className="mt-1 text-xs text-neutral-500">Separa por vírgulas.</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Preço do serviço</label>
              <input
                value={servicePrice}
                onChange={(e) => setServicePrice(e.target.value)}
                placeholder="Ex: 5000 Kz por viagem"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        <p className="text-xs text-neutral-500">
          Ao criar conta, aceitas os{' '}
          <Link to="/termos" target="_blank" className="font-medium text-xkwanza-600 hover:underline">
            Termos de Uso
          </Link>{' '}
          e a{' '}
          <Link to="/privacidade" target="_blank" className="font-medium text-xkwanza-600 hover:underline">
            Política de Privacidade
          </Link>{' '}
          da XKWANZA.
        </p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A criar conta...' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-neutral-500">
        Já tem conta?{' '}
        <Link to="/entrar" className="font-medium text-xkwanza-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
