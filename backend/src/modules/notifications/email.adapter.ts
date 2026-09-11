import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env';

// Envio real de email via SMTP — env-gated como o Supabase Storage: sem SMTP_HOST/SMTP_USER/
// SMTP_PASS configurados, o envio fica desactivado (nunca bloqueia a app; quem chama trata
// isto como "melhor esforço", nunca lança para o utilizador final).
export function isEmailConfigured(): boolean {
  return Boolean(env.email.host && env.email.user && env.email.pass);
}

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.secure,
    auth: { user: env.email.user, pass: env.email.pass },
  });
  return transporter;
}

export async function sendEmail(params: { to: string; subject: string; text: string }): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  try {
    await getTransporter().sendMail({
      from: env.email.from,
      to: params.to,
      subject: params.subject,
      text: params.text,
    });
    return true;
  } catch {
    // Falha de envio nunca deve derrubar o fluxo principal (ex: registo, checkout) — o email
    // é sempre um canal adicional ao IN_APP, nunca o único.
    return false;
  }
}
