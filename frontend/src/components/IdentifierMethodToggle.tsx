export type IdentifierMethod = 'phone' | 'email';

export function IdentifierMethodToggle({
  value,
  onChange,
}: {
  value: IdentifierMethod;
  onChange: (method: IdentifierMethod) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-md bg-neutral-100 p-1 text-sm font-medium">
      {(['phone', 'email'] as const).map((method) => (
        <button
          key={method}
          type="button"
          onClick={() => onChange(method)}
          className={`rounded px-3 py-1.5 transition ${
            value === method ? 'bg-white text-xkwanza-700 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          {method === 'phone' ? 'Telefone' : 'Email'}
        </button>
      ))}
    </div>
  );
}
