import type { ReactNode } from "react";

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-default bg-surface-secondary/70 p-4 sm:p-5 md:p-6">
      <h3 className="text-base font-semibold text-content-primary md:text-lg">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-6 text-content-secondary md:leading-7">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 text-sm leading-6 text-content-secondary marker:text-accent/70 md:leading-7">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
