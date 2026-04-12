"use client";

import type { TableComponent } from "../../../types";

export default function GrammarHowToUseSection({ howToUse }: { howToUse: TableComponent }) {
  const { headers, rows } = howToUse.content;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border-primary/50">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-pink-50/80 dark:bg-pink-950/20">
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-pink-700 dark:text-pink-300"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-t border-border-primary/30">
              {row.cells.map((cell, ci) => (
                <td
                  key={ci}
                  rowSpan={cell.rowspan ?? 1}
                  colSpan={cell.colspan ?? 1}
                  className="px-4 py-2.5 text-content-primary"
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
