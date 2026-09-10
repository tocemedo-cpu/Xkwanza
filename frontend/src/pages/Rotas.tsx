import { MapPin } from 'lucide-react';

// Placeholder — o planeamento de rotas com mapa e optimização de trajecto requer um provedor
// de mapas (ex: Google Maps/Mapbox) e a respectiva chave de API, que ainda não está configurada
// neste ambiente. A página fica reservada no menu para quando essa integração for activada.
export function Rotas() {
  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">Rotas</h1>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-neutral-300 p-10 text-center text-neutral-500">
        <MapPin size={32} className="text-neutral-300" />
        <p className="font-medium text-neutral-700">Planeamento de rotas em breve</p>
        <p className="text-sm">
          Esta funcionalidade vai mostrar um mapa com os seus fretes activos e sugestões de trajecto. Ainda não
          está disponível — consulte os seus fretes em "Meus fretes" enquanto isso.
        </p>
      </div>
    </div>
  );
}
