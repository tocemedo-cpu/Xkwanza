import { FormEvent, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteSetting, fetchSettings, upsertSetting } from '../services/settingsService';
import { PlatformSetting } from '../types/settings';

const inputClass =
  'rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const settingKeyRegex = /^[a-z0-9_.-]{2,80}$/;

function errorMessage(err: unknown, fallback: string): string {
  return (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback;
}

export function AdminSettings() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  function reload() {
    setIsLoading(true);
    fetchSettings()
      .then(setSettings)
      .finally(() => setIsLoading(false));
  }

  useEffect(reload, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    setError(null);

    if (!settingKeyRegex.test(key)) {
      setError('Chave inválida — use apenas minúsculas, números, "_", "." ou "-" (2 a 80 caracteres).');
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertSetting(key, value);
      setKey('');
      setValue('');
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível guardar a configuração.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEdit(setting: PlatformSetting) {
    setError(null);
    setEditingKey(setting.key);
    setEditValue(setting.value);
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  async function handleSaveEdit(settingKey: string) {
    setError(null);
    setIsSaving(true);
    try {
      await upsertSetting(settingKey, editValue);
      cancelEdit();
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível guardar a configuração.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(setting: PlatformSetting) {
    if (!confirm(`Remover a configuração "${setting.key}"?`)) return;
    setError(null);
    try {
      await deleteSetting(setting.key);
      reload();
    } catch (err: unknown) {
      setError(errorMessage(err, 'Não foi possível remover a configuração.'));
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-neutral-500">
          Pares chave/valor geridos pela administração — usados internamente pela plataforma conforme forem
          sendo adoptados por cada módulo.
        </p>
      </div>

      <form onSubmit={handleCreate} className="space-y-2 rounded-xl border border-neutral-200 bg-white p-4">
        <p className="text-sm font-medium text-neutral-900">Nova configuração</p>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 basis-48 space-y-1">
            <input
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="chave.da.configuracao"
              className={`${inputClass} w-full`}
            />
            <p className="text-xs text-neutral-400">
              Letras minúsculas, números, "_", "." ou "-" (2 a 80 caracteres).
            </p>
          </div>
          <textarea
            required
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor"
            rows={1}
            className={`${inputClass} flex-1 basis-48`}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="h-fit rounded-md bg-xkwanza-600 px-4 py-2 text-sm font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
          >
            {isSubmitting ? 'A guardar...' : 'Guardar'}
          </button>
        </div>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {isLoading && <p className="text-neutral-500">A carregar...</p>}

      {!isLoading && settings.length === 0 && (
        <p className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          Nenhuma configuração definida ainda.
        </p>
      )}

      {!isLoading && settings.length > 0 && (
        <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-white">
          {settings.map((setting) => (
            <div key={setting.key} className="flex flex-wrap items-start justify-between gap-3 p-4 text-sm">
              <div className="min-w-0 flex-1 space-y-1">
                <p className="font-medium text-neutral-900">{setting.key}</p>
                {editingKey === setting.key ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={2}
                    className={`${inputClass} w-full`}
                  />
                ) : (
                  <p className="break-words text-neutral-600">{setting.value}</p>
                )}
                <p className="text-xs text-neutral-400">
                  {setting.updatedBy?.name ?? 'Sistema'} · {new Date(setting.updatedAt).toLocaleString('pt-PT')}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {editingKey === setting.key ? (
                  <>
                    <button
                      onClick={() => handleSaveEdit(setting.key)}
                      disabled={isSaving}
                      className="text-xs font-medium text-xkwanza-600 hover:underline disabled:opacity-60"
                    >
                      {isSaving ? 'A guardar...' : 'Guardar'}
                    </button>
                    <button onClick={cancelEdit} className="text-xs font-medium text-neutral-500 hover:underline">
                      Cancelar
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(setting)}
                      className="text-xs font-medium text-xkwanza-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button onClick={() => handleDelete(setting)} className="text-neutral-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
