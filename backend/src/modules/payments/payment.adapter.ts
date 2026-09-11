import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';

// Adapter para o gateway de pagamento bancário/fintech real (métodos BANK_INTEGRATION e
// FINTECH_INTEGRATION). Mesmo padrão do inss.adapter.ts: em modo sandbox nunca liga a nenhuma
// API externa — simula sempre sucesso. O modo produção só fica disponível quando um provedor
// real (banco ou fintech angolana) e as respectivas credenciais forem configurados; até lá,
// tentar usá-lo falha de forma explícita em vez de fingir uma cobrança real.
export interface PaymentGatewayChargeResult {
  success: boolean;
  externalRef: string;
  message: string;
}

export function isPaymentGatewayProductionReady(): boolean {
  return Boolean(env.paymentGateway.provider && env.paymentGateway.apiKey);
}

function assertProductionReady() {
  if (env.paymentGateway.adapterMode === 'production' && !isPaymentGatewayProductionReady()) {
    throw ApiError.internal(
      'Gateway de pagamento em modo produção mas sem provedor/API key configurados (PAYMENT_GATEWAY_PROVIDER/PAYMENT_GATEWAY_API_KEY).',
    );
  }
}

export const paymentGatewayAdapter = {
  mode: env.paymentGateway.adapterMode,

  // Inicia uma cobrança junto do provedor. Em sandbox, devolve sempre sucesso simulado — o
  // pagamento fica PROCESSING e só avança para PAID através de confirmação manual do
  // suporte/administração (não existe callback real a simular) ou, em produção real, do
  // webhook do provedor.
  async initiateCharge(params: { orderId: string; amount: string; currency: string }): Promise<PaymentGatewayChargeResult> {
    if (env.paymentGateway.adapterMode !== 'production') {
      return {
        success: true,
        externalRef: `SANDBOX-${params.orderId}`,
        message: 'Cobrança simulada em sandbox — sem ligação real a banco/fintech.',
      };
    }
    assertProductionReady();
    throw ApiError.internal(
      `Integração real com o provedor "${env.paymentGateway.provider}" ainda não está implementada neste adaptador — só o sandbox está disponível.`,
    );
  },

  // Verifica a assinatura HMAC de um webhook do provedor — nunca processa um payload não
  // assinado em produção. Em sandbox aceita sempre (não há segredo real a verificar).
  verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
    if (env.paymentGateway.adapterMode !== 'production') return true;
    if (!env.paymentGateway.webhookSecret || !signatureHeader) return false;
    const expected = createHmac('sha256', env.paymentGateway.webhookSecret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected);
    const receivedBuf = Buffer.from(signatureHeader);
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
  },
};
