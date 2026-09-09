import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { TransportStatusBadge } from '../components/TransportStatusBadge';
import { useAuth } from '../hooks/useAuth';
import {
  acceptAssignment,
  acceptProposal,
  cancelTransportOrder,
  confirmDelivery,
  confirmPickup,
  fetchProposals,
  fetchTransportOrder,
  startTransit,
  submitProposal,
} from '../services/transportService';
import { TransportOrder, TransportProposal } from '../types/logistics';
import { formatKwanza } from '../utils/angola';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

export function TransportOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [job, setJob] = useState<TransportOrder | null>(null);
  const [proposals, setProposals] = useState<TransportProposal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [proposalPrice, setProposalPrice] = useState('');
  const [proposalMessage, setProposalMessage] = useState('');
  const [otp, setOtp] = useState('');

  function reload() {
    if (!id) return;
    fetchTransportOrder(id)
      .then((data) => {
        setJob(data);
        return data;
      })
      .then((data) => {
        const isBuyer = data.order.buyerId === user?.id;
        const isSeller = data.order.items.some((item) => item.product.ownerId === user?.id);
        if (isBuyer || isSeller) {
          fetchProposals(data.id).then(setProposals).catch(() => setProposals([]));
        }
      })
      .catch(() => setError('Pedido de transporte não encontrado ou sem acesso.'));
  }

  useEffect(reload, [id, user?.id]);

  if (error) return <p className="text-neutral-500">{error}</p>;
  if (!job || !user) return <p className="text-neutral-500">A carregar...</p>;

  const isBuyer = job.order.buyerId === user.id;
  const isSeller = job.order.items.some((item) => item.product.ownerId === user.id);
  const isAssignedTransporter = job.transporter?.userId === user.id;
  const canPropose = user.role === 'TRANSPORTER' && job.status === 'REQUESTED' && !isAssignedTransporter;
  const canCancel = ['REQUESTED', 'ASSIGNED', 'ACCEPTED'].includes(job.status) && (isBuyer || isSeller || isAssignedTransporter);

  async function runAction(action: () => Promise<TransportOrder>) {
    setIsBusy(true);
    setError(null);
    try {
      const updated = await action();
      setJob(updated);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível concluir a acção.';
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSubmitProposal(event: FormEvent) {
    event.preventDefault();
    if (!id) return;
    setIsBusy(true);
    setError(null);
    try {
      await submitProposal(id, { price: Number(proposalPrice), message: proposalMessage || undefined });
      setProposalPrice('');
      setProposalMessage('');
      reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Não foi possível enviar a proposta.';
      setError(message);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Link to={user.role === 'TRANSPORTER' ? '/meus-fretes' : `/pedidos/${job.orderId}`} className="text-sm text-xkwanza-600 hover:underline">
        ← Voltar
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Transporte #{job.id.slice(0, 8)}</h1>
          <p className="text-sm text-neutral-500">
            Pedido{' '}
            <Link to={`/pedidos/${job.orderId}`} className="text-xkwanza-600 hover:underline">
              #{job.orderId.slice(0, 8)}
            </Link>
          </p>
        </div>
        <TransportStatusBadge status={job.status} />
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
        <p className="font-semibold text-neutral-900">Entrega em</p>
        <p>
          {job.order.shippingAddress.locality ? `${job.order.shippingAddress.locality}, ` : ''}
          {job.order.shippingAddress.municipality}, {job.order.shippingAddress.province}
        </p>
        <p className="mt-2 text-neutral-500">
          {job.order.items.length} item(ns) · Valor da encomenda {formatKwanza(Number(job.order.total))}
        </p>
        {job.agreedPrice && (
          <p className="mt-1 font-medium text-neutral-900">Preço do frete: {formatKwanza(Number(job.agreedPrice))}</p>
        )}
      </div>

      {job.transporter && (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          <p className="font-semibold text-neutral-900">Transportador</p>
          <p>
            {job.transporter.user?.name} · {job.transporter.vehicleType ?? 'Veículo não especificado'}
          </p>
          {(isBuyer || isSeller) && job.transporter.user?.phone && <p className="text-neutral-500">{job.transporter.user.phone}</p>}
        </div>
      )}

      {isSeller && job.pickupOtp && (
        <div className="rounded-xl border border-xkwanza-200 bg-xkwanza-50 p-4 text-sm">
          <p className="font-semibold text-xkwanza-800">Código de recolha</p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-xkwanza-700">{job.pickupOtp}</p>
          <p className="mt-1 text-xkwanza-700">Entregue este código ao transportador apenas no momento da recolha.</p>
        </div>
      )}

      {isBuyer && job.deliveryOtp && (
        <div className="rounded-xl border border-xkwanza-200 bg-xkwanza-50 p-4 text-sm">
          <p className="font-semibold text-xkwanza-800">Código de entrega</p>
          <p className="mt-1 text-2xl font-bold tracking-widest text-xkwanza-700">{job.deliveryOtp}</p>
          <p className="mt-1 text-xkwanza-700">Entregue este código ao transportador apenas ao receber a encomenda.</p>
        </div>
      )}

      {(isSeller || isBuyer) && job.status === 'REQUESTED' && (
        <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="font-semibold text-neutral-900">Propostas ({proposals.length})</p>
          {proposals.length === 0 && <p className="text-sm text-neutral-500">Ainda sem propostas de transportadores.</p>}
          {proposals.map((proposal) => (
            <div key={proposal.id} className="flex items-center justify-between border-t border-neutral-100 py-2 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{proposal.transporter.user?.name}</p>
                <p className="text-neutral-500">{proposal.message}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-neutral-900">{formatKwanza(Number(proposal.price))}</span>
                {isSeller && (
                  <button
                    disabled={isBusy}
                    onClick={() => runAction(() => acceptProposal(job.id, proposal.id))}
                    className="rounded-md bg-xkwanza-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
                  >
                    Aceitar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {canPropose && (
        <form onSubmit={handleSubmitProposal} className="space-y-3 rounded-xl border border-neutral-200 bg-white p-4">
          <p className="font-semibold text-neutral-900">Propor frete</p>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Preço (Kz)</label>
            <input
              required
              type="number"
              min={0}
              step="0.01"
              value={proposalPrice}
              onChange={(e) => setProposalPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-neutral-700">Mensagem (opcional)</label>
            <textarea
              rows={2}
              value={proposalMessage}
              onChange={(e) => setProposalMessage(e.target.value)}
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            Enviar proposta
          </button>
        </form>
      )}

      {isAssignedTransporter && job.status === 'ASSIGNED' && (
        <button
          disabled={isBusy}
          onClick={() => runAction(() => acceptAssignment(job.id))}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-3 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          Aceitar atribuição
        </button>
      )}

      {isAssignedTransporter && job.status === 'ACCEPTED' && (
        <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Código de recolha (dado pelo vendedor)</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className={inputClass} placeholder="000000" />
          <button
            disabled={isBusy || otp.length !== 6}
            onClick={() => runAction(() => confirmPickup(job.id, otp))}
            className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            Confirmar recolha
          </button>
        </div>
      )}

      {isAssignedTransporter && job.status === 'PICKED_UP' && (
        <button
          disabled={isBusy}
          onClick={() => runAction(() => startTransit(job.id))}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-3 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          Iniciar trânsito
        </button>
      )}

      {isAssignedTransporter && job.status === 'IN_TRANSIT' && (
        <div className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Código de entrega (dado pelo comprador)</label>
          <input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} className={inputClass} placeholder="000000" />
          <button
            disabled={isBusy || otp.length !== 6}
            onClick={() => runAction(() => confirmDelivery(job.id, otp))}
            className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            Confirmar entrega
          </button>
        </div>
      )}

      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <p className="mb-2 font-semibold text-neutral-900">Histórico</p>
        <ul className="space-y-1 text-sm text-neutral-600">
          {job.statusHistory.map((event) => (
            <li key={event.id} className="flex justify-between">
              <TransportStatusBadge status={event.status} />
              <span className="text-neutral-400">{new Date(event.createdAt).toLocaleString('pt-AO')}</span>
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {canCancel && (
        <button
          disabled={isBusy}
          onClick={() => runAction(() => cancelTransportOrder(job.id))}
          className="w-full rounded-md border border-red-300 px-4 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          Cancelar transporte
        </button>
      )}
    </div>
  );
}
