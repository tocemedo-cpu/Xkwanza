// Monograma da marca — duas barras a cruzar (percursos que se encontram, como o comércio e a
// formalização) num crachá verde-petróleo, com um acento dourado a lembrar valor/moeda. Substitui
// o antigo "X" preso num quadrado de gradiente, usado antes em três sítios diferentes do código.
function Mark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="xkwanza-mark-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#14735E" />
          <stop offset="100%" stopColor="#0A3830" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#xkwanza-mark-grad)" />
      <g transform="translate(20 20)">
        <rect x="-3" y="-13" width="6" height="26" rx="3" fill="white" transform="rotate(45)" />
        <rect x="-3" y="-13" width="6" height="26" rx="3" fill="white" fillOpacity="0.85" transform="rotate(-45)" />
      </g>
      <circle cx="30.5" cy="9.5" r="3.5" fill="#F3AC24" />
    </svg>
  );
}

export function Logo({
  variant = 'full',
  size = 36,
  onDark = true,
  className = '',
}: {
  variant?: 'mark' | 'full';
  size?: number;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Mark size={size} />
      {variant === 'full' && (
        <span
          className={`text-lg font-extrabold tracking-tight ${onDark ? 'text-white' : 'text-xkwanza-900'}`}
        >
          XKWANZA
        </span>
      )}
    </span>
  );
}
