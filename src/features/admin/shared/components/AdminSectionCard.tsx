"use client";

import type { ReactNode } from "react";

interface AdminSectionCardProps {
  title: string;
  children: ReactNode;
}

export function AdminSectionCard({ title, children }: AdminSectionCardProps) {
  return (
    <section className="rounded-2xl border border-border-default bg-surface-primary p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-content-primary">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
