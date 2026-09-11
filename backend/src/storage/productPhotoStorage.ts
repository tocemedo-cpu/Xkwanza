import { randomUUID } from 'node:crypto';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env';
import { ApiError } from '../utils/apiError';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

let client: SupabaseClient | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(env.supabaseStorage.url && env.supabaseStorage.serviceRoleKey);
}

function getClient(): SupabaseClient {
  if (!isStorageConfigured()) {
    throw ApiError.internal(
      'Upload de imagens não está configurado neste ambiente (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY em falta). Usa o campo de URL em alternativa.',
    );
  }
  client ??= createClient(env.supabaseStorage.url, env.supabaseStorage.serviceRoleKey);
  return client;
}

// Envia a foto para o Supabase Storage (bucket público) e devolve o URL público estável.
// Cada envio usa um caminho novo (ownerId/uuid.ext) — nunca reaproveita nem apaga o anterior,
// mantendo o histórico simples e evitando condições de corrida entre uploads concorrentes.
export async function uploadProductPhoto(params: { buffer: Buffer; mimeType: string; ownerId: string }): Promise<string> {
  const extension = ALLOWED_MIME_TYPES[params.mimeType];
  if (!extension) {
    throw ApiError.badRequest('Tipo de imagem não suportado — usa JPEG, PNG ou WEBP');
  }
  if (params.buffer.length > MAX_PHOTO_BYTES) {
    throw ApiError.badRequest('Imagem demasiado grande — o limite é 5MB');
  }

  const supabase = getClient();
  const path = `${params.ownerId}/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(env.supabaseStorage.bucket)
    .upload(path, params.buffer, { contentType: params.mimeType, upsert: false });

  if (uploadError) {
    throw ApiError.internal(`Falha ao enviar imagem para o armazenamento: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(env.supabaseStorage.bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Mesmo bucket partilhado, pasta "banners/" — usado pelas imagens do carrossel da homepage
// geridas pela administração (não têm um "dono" como as fotos de produto).
export async function uploadBannerImage(params: { buffer: Buffer; mimeType: string }): Promise<string> {
  const extension = ALLOWED_MIME_TYPES[params.mimeType];
  if (!extension) {
    throw ApiError.badRequest('Tipo de imagem não suportado — usa JPEG, PNG ou WEBP');
  }
  if (params.buffer.length > MAX_PHOTO_BYTES) {
    throw ApiError.badRequest('Imagem demasiado grande — o limite é 5MB');
  }

  const supabase = getClient();
  const path = `banners/${randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(env.supabaseStorage.bucket)
    .upload(path, params.buffer, { contentType: params.mimeType, upsert: false });

  if (uploadError) {
    throw ApiError.internal(`Falha ao enviar imagem para o armazenamento: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(env.supabaseStorage.bucket).getPublicUrl(path);
  return data.publicUrl;
}
