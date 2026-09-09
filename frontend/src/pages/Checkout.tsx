import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { createAddress, fetchMyAddresses } from '../services/addressesService';
import { checkout } from '../services/ordersService';
import { Address } from '../types/marketplace';
import { ANGOLA_PROVINCES, formatKwanza } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function Checkout() {
  const { items, totalAmount, clear } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);

  const [province, setProvince] = useState<string>(ANGOLA_PROVINCES[0]);
  const [municipality, setMunicipality] = useState('');
  const [locality, setLocality] = useState('');
  const [reference, setReference] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyAddresses().then((data) => {
      setAddresses(data);
      if (data.length > 0) setSelectedAddressId(data[0].id);
      else setShowNewAddress(true);
    });
  }, []);

  async function handleAddAddress(event: FormEvent) {
    event.preventDefault();
    const address = await createAddress({ province, municipality, locality, reference, isDefault: addresses.length === 0 });
    setAddresses((prev) => [address, ...prev]);
    setSelectedAddressId(address.id);
    setShowNewAddress(false);
  }

  async function handleConfirm() {
    if (!selectedAddressId) {
      setError('Seleccione uma morada de entrega.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const order = await checkout({
        shippingAddressId: selectedAddressId,
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      });
      clear();
      navigate(`/pedidos/${order.id}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível concluir o pedido.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="text-neutral-500">O seu carrinho está vazio.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>

      <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold text-neutral-900">Morada de entrega</h2>

        {addresses.map((address) => (
          <label key={address.id} className="flex items-start gap-3 rounded-md border border-neutral-200 p-3">
            <input
              type="radio"
              name="address"
              checked={selectedAddressId === address.id}
              onChange={() => setSelectedAddressId(address.id)}
              className="mt-1"
            />
            <span className="text-sm text-neutral-700">
              {address.label && <span className="font-medium">{address.label} — </span>}
              {address.locality ? `${address.locality}, ` : ''}
              {address.municipality}, {address.province}
              {address.reference && <span className="block text-neutral-500">{address.reference}</span>}
            </span>
          </label>
        ))}

        {!showNewAddress && (
          <button
            type="button"
            onClick={() => setShowNewAddress(true)}
            className="text-sm font-medium text-xkwanza-600 hover:underline"
          >
            + Adicionar nova morada
          </button>
        )}

        {showNewAddress && (
          <form onSubmit={handleAddAddress} className="space-y-3 border-t border-neutral-100 pt-3">
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
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Localidade (opcional)</label>
              <input value={locality} onChange={(e) => setLocality(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-neutral-700">Referência (opcional)</label>
              <input value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} />
            </div>
            <button
              type="submit"
              className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
            >
              Guardar morada
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-6">
        <h2 className="font-semibold text-neutral-900">Resumo</h2>
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm text-neutral-700">
            <span>
              {item.quantity}× {item.product.name}
            </span>
            <span>{formatKwanza(Number(item.product.price) * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-neutral-100 pt-2 font-semibold text-neutral-900">
          <span>Total</span>
          <span>{formatKwanza(totalAmount)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="w-full rounded-md bg-xkwanza-600 px-4 py-3 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
      >
        {isSubmitting ? 'A confirmar...' : 'Confirmar pedido'}
      </button>
    </div>
  );
}
