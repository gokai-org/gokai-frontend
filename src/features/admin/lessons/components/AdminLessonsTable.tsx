"use client";

import { Loader2, PenSquare, TriangleAlert } from "lucide-react";
import { AdminTableLoadingRows } from "@/features/admin/shared/components/AdminTableLoadingRows";
import type { AdminGrammarLessonSummary } from "../types/grammar";

interface AdminLessonsTableProps {
  items: AdminGrammarLessonSummary[];
  loading: boolean;
  error: string | null;
  pendingEditId: string | null;
  onEditItem: (lessonId: string) => void;
}

export function AdminLessonsTable({
  items,
  loading,
  error,
  pendingEditId,
  onEditItem,
}: AdminLessonsTableProps) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-border-subtle bg-surface-primary shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-4 sm:px-5">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-accent/80">
            Catálogo de gramática
          </p>
          <h2 className="mt-1 text-lg font-bold text-content-primary">
            Lecciones editables
          </h2>
        </div>
        <div className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
          Solo edición
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="bg-surface-secondary/65 text-xs uppercase tracking-[0.14em] text-content-tertiary">
              <th className="px-3 py-3 font-black sm:px-4">Lección</th>
              <th className="px-3 py-3 font-black sm:px-4">Examen</th>
              <th className="px-3 py-3 font-black sm:px-4">Puntos</th>
              <th className="px-3 py-3 font-black sm:px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <AdminTableLoadingRows columnCount={4} rowCount={7} /> : null}

            {!loading && error ? (
              <tr>
                <td colSpan={4} className="px-4 py-10">
                  <div className="flex items-center justify-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-4 text-sm text-red-400">
                    <TriangleAlert className="h-4 w-4" />
                    {error}
                  </div>
                </td>
              </tr>
            ) : null}

            {!loading && !error && items.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-content-muted">
                  No se encontraron lecciones con ese criterio.
                </td>
              </tr>
            ) : null}

            {!loading && !error
              ? items.map((item) => {
                  const isPending = pendingEditId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-border-subtle align-top transition-colors hover:bg-surface-secondary/35"
                    >
                      <td className="px-3 py-4 sm:px-4">
                        <div className="space-y-1.5">
                          <p className="font-semibold text-content-primary">{item.title}</p>
                          <p className="line-clamp-2 text-sm text-content-secondary">
                            {item.description || "Sin descripción"}
                          </p>
                          <p className="text-xs text-content-muted">{item.id}</p>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-content-secondary sm:px-4">
                        {item.examCount}
                      </td>
                      <td className="px-3 py-4 text-sm text-content-secondary sm:px-4">
                        {item.pointsToUnlock ?? "-"}
                      </td>
                      <td className="px-3 py-4 sm:px-4">
                        <button
                          type="button"
                          onClick={() => onEditItem(item.id)}
                          disabled={isPending}
                          className="inline-flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-semibold text-content-inverted transition-colors hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
                        >
                          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenSquare className="h-4 w-4" />}
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })
              : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}