"use client";

import type { ReactNode } from "react";

interface AdminSectionCardProps {
  title: string;
  children: ReactNode;
}

export function AdminSectionCard({ title, children }: AdminSectionCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
