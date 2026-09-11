import { env } from '../../config/env';

// Push real requer um provedor (FCM/OneSignal/Web Push) com credenciais próprias e, do lado do
// cliente, registo de dispositivo — nada disso está implementado ainda. Esta é uma ponte
// genérica: quando PUSH_WEBHOOK_URL estiver configurado (relay operado por quem gerir esse
// provedor), reencaminha o evento para lá; sem isso, fica desactivado (nunca bloqueia a app).
export function isPushConfigured(): boolean {
  return Boolean(env.push.webhookUrl);
}

export async function sendPush(params: { userId: string; title: string; body: string }): Promise<boolean> {
  if (!isPushConfigured()) return false;
  try {
    const res = await fetch(env.push.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.ok;
  } catch {
    return false;
  }
}
