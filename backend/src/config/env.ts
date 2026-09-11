import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória em falta: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  adminTaskSecret: process.env.ADMIN_TASK_SECRET ?? '',

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },

  security: {
    bcryptRounds: Number(process.env.BCRYPT_ROUNDS ?? 12),
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 900000),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 300),
    authRateLimitMax: Number(process.env.AUTH_RATE_LIMIT_MAX ?? 10),
  },

  inss: {
    // Nunca "production" sem acordo institucional formal e credenciais oficiais.
    adapterMode: (process.env.INSS_ADAPTER_MODE ?? 'sandbox') as 'sandbox' | 'production',
  },

  // Upload de imagens de produto via Supabase Storage. Sem estas variáveis definidas, o
  // upload fica desactivado (mas a app continua a funcionar — fotos por URL continuam a dar).
  supabaseStorage: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'product-photos',
  },

  // Gateway de pagamento bancário/fintech real (BANK_INTEGRATION/FINTECH_INTEGRATION). Nunca
  // "production" sem acordo institucional formal e credenciais reais de um provedor — enquanto
  // isso não existir, todo o fluxo corre em sandbox (simulado, sem ligação externa nenhuma).
  paymentGateway: {
    adapterMode: (process.env.PAYMENT_ADAPTER_MODE ?? 'sandbox') as 'sandbox' | 'production',
    provider: process.env.PAYMENT_GATEWAY_PROVIDER ?? '',
    apiKey: process.env.PAYMENT_GATEWAY_API_KEY ?? '',
    webhookSecret: process.env.PAYMENT_GATEWAY_WEBHOOK_SECRET ?? '',
  },

  // Envio real de email — sem estas variáveis, as notificações continuam a existir só IN_APP
  // (nunca bloqueia a app; ver notifications/email.adapter.ts).
  email: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'XKwanza <no-reply@xkwanza.co.ao>',
  },

  // Notificações push — sem provedor próprio integrado, esta é apenas uma ponte genérica por
  // webhook para um relay externo (ex: OneSignal/FCM) que o operador configure mais tarde.
  push: {
    webhookUrl: process.env.PUSH_WEBHOOK_URL ?? '',
  },
};
