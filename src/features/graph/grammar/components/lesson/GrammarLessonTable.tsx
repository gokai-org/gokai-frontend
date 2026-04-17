"use client";

import type { TableComponent } from "../../types";

interface GrammarLessonTableProps {
  table: TableComponent;
}

export default function GrammarLessonTable({ table }: GrammarLessonTableProps) {
  const headers = table.content.headers;
  const rows = table.content.rows;

  if (rows.length === 0) {
    return (
      <div className="rounded-[18px] bg-surface-secondary/42 px-3.5 py-4 text-[13px] text-content-secondary shadow-[0_10px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] lg:px-4 lg:py-5 lg:text-sm">
        Esta sección todavía no trae filas para mostrar.
      </div>
    );
  }

  return (
    <div className="space-y-2.5 lg:space-y-3">
      <div className="overflow-hidden rounded-[18px] bg-surface-primary shadow-[0_14px_32px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] lg:rounded-2xl lg:shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-[13px] lg:text-sm">
            <thead>
              <tr className="bg-accent/8">
                {headers.map((header, index) => (
                  <th
                    key={`${header}-${index}`}
                    className="border-b border-border-subtle px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.14em] text-accent lg:px-4 lg:py-3 lg:text-xs lg:tracking-[0.18em]"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="align-top odd:bg-surface-primary even:bg-surface-secondary/35">
                  {row.cells.map((cell, cellIndex) => (
                    <td
                      key={`cell-${rowIndex}-${cellIndex}-${cell.value}`}
                      rowSpan={Math.max(cell.rowspan, 1)}
                      colSpan={Math.max(cell.colspan, 1)}
                      className={[
                        "border-b border-border-subtle px-3 py-2.5 text-[13px] leading-[1.45] text-content-secondary whitespace-pre-wrap lg:px-4 lg:py-3 lg:text-sm lg:leading-relaxed",
                        cellIndex === 0 ? "font-semibold text-content-primary" : "",
                      ].join(" ")}
                    >
                      {cell.value || <span className="text-content-muted">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-content-muted lg:text-xs">
        Puedes desplazarte horizontalmente si la estructura es más ancha que la ventana.
      </p>
    </div>
  );
}