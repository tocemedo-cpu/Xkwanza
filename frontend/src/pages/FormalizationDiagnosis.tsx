import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitDiagnosis } from '../services/formalizationService';
import { FormalizationDiagnosisInput } from '../types/formalization';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 focus:border-xkwanza-500 focus:outline-none focus:ring-1 focus:ring-xkwanza-500';

const BOOLEAN_QUESTIONS: { key: keyof FormalizationDiagnosisInput; label: string }[] = [
  { key: 'hasNif', label: 'Já tem NIF (Número de Identificação Fiscal)?' },
  { key: 'hasInss', label: 'Já está inscrito no INSS?' },
  { key: 'worksAlone', label: 'Trabalha sozinho(a)?' },
  { key: 'hasHelpers', label: 'Tem ajudantes ou colaboradores?' },
  { key: 'sellsInMarket', label: 'Vende num mercado?' },
  { key: 'worksOnStreet', label: 'Vende na rua?' },
  { key: 'worksFromHome', label: 'Trabalha a partir de casa?' },
  { key: 'worksOnFarm', label: 'Trabalha numa machamba/exploração agrícola?' },
  { key: 'doesDeliveries', label: 'Faz entregas aos clientes?' },
  { key: 'usesOwnVehicle', label: 'Usa veículo próprio para o trabalho?' },
];

export function FormalizationDiagnosis() {
  const navigate = useNavigate();
  const [activityDescription, setActivityDescription] = useState('');
  const [workLocation, setWorkLocation] = useState('');
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const input: FormalizationDiagnosisInput = {
        activityDescription,
        workLocation,
        hasNif: Boolean(answers.hasNif),
        hasInss: Boolean(answers.hasInss),
        worksAlone: Boolean(answers.worksAlone),
        hasHelpers: Boolean(answers.hasHelpers),
        sellsInMarket: Boolean(answers.sellsInMarket),
        worksOnStreet: Boolean(answers.worksOnStreet),
        worksFromHome: Boolean(answers.worksFromHome),
        worksOnFarm: Boolean(answers.worksOnFarm),
        doesDeliveries: Boolean(answers.doesDeliveries),
        usesOwnVehicle: Boolean(answers.usesOwnVehicle),
      };
      await submitDiagnosis(input);
      navigate('/formalizacao');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível concluir o diagnóstico.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Diagnóstico de formalização</h1>
        <p className="text-neutral-500">
          Responda a estas perguntas para percebermos a sua situação e sugerirmos o próximo passo prático.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 bg-white p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Descreva a sua actividade</label>
          <textarea
            required
            minLength={5}
            rows={3}
            value={activityDescription}
            onChange={(e) => setActivityDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-700">Onde trabalha?</label>
          <input required value={workLocation} onChange={(e) => setWorkLocation(e.target.value)} className={inputClass} />
        </div>

        <div className="space-y-2">
          {BOOLEAN_QUESTIONS.map((q) => (
            <label key={q.key} className="flex items-center gap-2 text-sm text-neutral-700">
              <input
                type="checkbox"
                checked={Boolean(answers[q.key])}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [q.key]: e.target.checked }))}
              />
              {q.label}
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md bg-xkwanza-600 px-4 py-2 font-medium text-white hover:bg-xkwanza-700 disabled:opacity-60"
        >
          {isSubmitting ? 'A processar...' : 'Concluir diagnóstico'}
        </button>
      </form>
    </div>
  );
}
