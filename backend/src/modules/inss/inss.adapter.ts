import { INSSAdapterMode } from '@prisma/client';
import { env } from '../../config/env';
import { ApiError } from '../../utils/apiError';

// Adapter + Mock/Sandbox — nunca liga a uma API real do INSS. Enquanto não existir
// integração institucional autorizada (Fase 8), todas as chamadas são simuladas e
// claramente registadas como SANDBOX. Nunca produzir um NISS, estado ou decisão como
// se viesse do INSS real.
export interface INSSAdapterResult {
  success: boolean;
  message: string;
}

function assertSandboxOnly() {
  if (env.inss.adapterMode !== 'sandbox') {
    throw ApiError.internal(
      'Modo de produção do INSS não está configurado — sem integração institucional autorizada, só o sandbox está disponível',
    );
  }
}

export const inssAdapter = {
  mode: INSSAdapterMode.SANDBOX,

  // Simula o envio do pedido de ligação para uma fila de processamento do INSS.
  async submit(): Promise<INSSAdapterResult> {
    assertSandboxOnly();
    return { success: true, message: 'Pedido colocado numa fila de processamento simulada (sandbox).' };
  },

  // Simula uma consulta de estado — nunca avança sozinho para VERIFIED/REJECTED,
  // pois isso exigiria uma decisão real do INSS que este adapter não pode fornecer.
  async checkStatus(): Promise<INSSAdapterResult> {
    assertSandboxOnly();
    return {
      success: true,
      message: 'Ainda em processamento simulado — sem integração institucional real, este estado nunca avança automaticamente.',
    };
  },
};
