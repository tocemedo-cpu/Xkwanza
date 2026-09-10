import { ReactNode } from 'react';

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-bold text-green-950">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
