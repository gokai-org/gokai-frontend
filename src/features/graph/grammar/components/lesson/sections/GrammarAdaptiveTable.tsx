"use client";

import type { ReactNode } from "react";
import type { TableComponent } from "../../../types";
import { useGrammarTableLayout } from "../../../hooks/useGrammarTableLayout";
import {
  looksLikeGrammarFormula,
  type GrammarTableSection,
  type ResolvedGrammarTableLayout,
} from "../../../lib/grammarTableLayout";

type Props = {
  table: TableComponent;
  section: GrammarTableSection;
  visibleRowIndex?: number;
};

function FieldEyebrow({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <p className={[
      "text-[11px] font-black uppercase tracking-[0.16em]",
      accent ? "text-[var(--accent)]" : "text-content-muted",
    ].join(" ")}>
      {children}
    </p>
  );
}

function HighlightFormula({ value }: { value: string }) {
  const parts = value
    .split(/(\bS\d\b|ですか|です|ますか|ます|ませんでした|ません|ました|じゃありません|じゃないです|じゃない|ではありません|こちら|そちら|あちら|どちら|これ|それ|あれ|どれ|この|その|あの|どの|ここ|そこ|あそこ|どこ|は|が|を|に|で|と|も|の|へ|から|まで|より|か)/)
    .filter(Boolean);

  return (
    <span className="inline-flex flex-wrap items-center gap-x-1.5 gap-y-2">
      {parts.map((part, index) => {
        if (/^S\d$/.test(part)) {
          return (
            <span
              key={`${part}-${index}`}
              className="rounded-full border border-border-subtle bg-surface-secondary px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-content-secondary"
            >
              {part}
            </span>
          );
        }

        if (/^(は|が|を|に|で|と|も|の|へ|から|まで|より|か)$/.test(part)) {
          return (
            <span key={`${part}-${index}`} className="font-black text-[var(--accent)]">
              {part}
            </span>
          );
        }

        if (/^(ですか|です|ますか|ます|ませんでした|ません|ました|じゃありません|じゃないです|じゃない|ではありません)$/.test(part)) {
          return (
            <span key={`${part}-${index}`} className="font-black text-[var(--accent-hover)]">
              {part}
            </span>
          );
        }

        if (/^(こちら|そちら|あちら|どちら|これ|それ|あれ|どれ|この|その|あの|どの|ここ|そこ|あそこ|どこ)$/.test(part)) {
          return (
            <span key={`${part}-${index}`} className="font-bold text-content-primary">
              {part}
            </span>
          );
        }

        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </span>
  );
}

function ValueBlock({
  header,
  value,
  emphasize,
}: {
  header: string;
  value: string;
  emphasize?: boolean;
}) {
  const shouldHighlight = emphasize || looksLikeGrammarFormula(value);

  return (
    <div
      className="rounded-2xl border border-border-subtle bg-surface-elevated/90 p-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.03)]"
    >
      <FieldEyebrow accent>{header}</FieldEyebrow>
      <div className="mt-2.5 text-[15px] font-semibold leading-relaxed text-content-primary">
        {shouldHighlight ? <HighlightFormula value={value} /> : value}
      </div>
    </div>
  );
}

function getPrimaryValue(layout: ResolvedGrammarTableLayout, row: string[], index: number) {
  return row[layout.primaryColumn]?.trim() || `${index + 1}`;
}

function PrimaryCardHeader({
  title,
  label,
}: {
  title: string;
  label?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--accent)]/12 bg-[var(--accent-subtle)] px-4 py-4 sm:px-5">
      {label ? <FieldEyebrow accent>{label}</FieldEyebrow> : null}
      <h4 className="mt-1 text-[clamp(1.3rem,1.08rem+0.55vw,1.75rem)] font-black leading-[1.05] text-content-primary">
        {title}
      </h4>
    </div>
  );
}

function SecondaryGrid({
  layout,
  row,
}: {
  layout: ResolvedGrammarTableLayout;
  row: string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {layout.headers.map((header, cellIndex) => {
        const value = row[cellIndex]?.trim();
        if (!value || cellIndex === layout.primaryColumn) {
          return null;
        }

        return (
          <ValueBlock
            key={`${header}-${cellIndex}-${value}`}
            header={header}
            value={value}
            emphasize={layout.formulaColumns.includes(cellIndex)}
          />
        );
      })}
    </div>
  );
}

function PatternDeck({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="space-y-3">
      {layout.rows.map((row, index) => {
        const primaryValue = getPrimaryValue(layout, row, index);

        return (
          <article key={`${primaryValue}-${index}`} className="overflow-hidden rounded-[26px] border border-border-subtle bg-surface-primary/70">
            <div className="space-y-4 p-4 sm:p-5">
              <PrimaryCardHeader
                title={primaryValue}
                label={layout.headers[layout.primaryColumn]}
              />
              <SecondaryGrid layout={layout} row={row} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ContrastCards({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {layout.rows.map((row, index) => {
        const primaryValue = getPrimaryValue(layout, row, index);
        const secondaryEntries = layout.headers
          .map((header, cellIndex) => ({
            header,
            value: row[cellIndex]?.trim() ?? "",
            cellIndex,
          }))
          .filter((entry) => entry.value && entry.cellIndex !== layout.primaryColumn);

        return (
          <article key={`${primaryValue}-${index}`} className="rounded-[26px] border border-border-subtle bg-gradient-to-br from-surface-elevated via-surface-elevated to-surface-secondary p-4 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <PrimaryCardHeader
              title={primaryValue}
              label={layout.headers[layout.primaryColumn]}
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {secondaryEntries.map((entry) => (
                <div key={`${entry.header}-${entry.cellIndex}`} className="rounded-2xl border border-border-subtle bg-surface-primary/80 px-3.5 py-3">
                  <FieldEyebrow accent>{entry.header}</FieldEyebrow>
                  <div className="mt-2 text-[15px] leading-relaxed text-content-primary">
                    {layout.formulaColumns.includes(entry.cellIndex) || looksLikeGrammarFormula(entry.value)
                      ? <HighlightFormula value={entry.value} />
                      : entry.value}
                  </div>
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function PanelBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-primary/80 p-3.5 shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
      <FieldEyebrow accent>{title}</FieldEyebrow>
      <div className="mt-2.5 text-[15px] leading-[1.8] text-content-secondary">{children}</div>
    </div>
  );
}

function ConceptPanels({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="space-y-3">
      {layout.rows.map((row, index) => {
        const primaryValue = getPrimaryValue(layout, row, index);
        const details = layout.headers
          .map((header, cellIndex) => ({
            header,
            value: row[cellIndex]?.trim() ?? "",
            cellIndex,
          }))
          .filter((entry) => entry.value && entry.cellIndex !== layout.primaryColumn);

        return (
          <article key={`${primaryValue}-${index}`} className="overflow-hidden rounded-[28px] border border-border-subtle bg-gradient-to-br from-surface-elevated via-surface-elevated to-surface-secondary">
            <div className="space-y-4 p-4 sm:p-5">
              <PrimaryCardHeader
                title={primaryValue}
                label={layout.headers[layout.primaryColumn]}
              />

              <div className="grid gap-3 sm:grid-cols-2">
                {details.map((entry) => (
                  <PanelBlock key={`${entry.header}-${entry.cellIndex}`} title={entry.header}>
                    {layout.formulaColumns.includes(entry.cellIndex) || looksLikeGrammarFormula(entry.value)
                      ? <HighlightFormula value={entry.value} />
                      : entry.value}
                  </PanelBlock>
                ))}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MatrixDesktop({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="hidden overflow-x-auto rounded-[26px] border border-border-subtle sm:block">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-[var(--accent-subtle)]">
            {layout.headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                className={[
                  "border-b border-border-subtle px-4 py-3 text-[11px] font-black uppercase tracking-[0.16em] text-[var(--accent)]",
                  index === 0 ? "sticky left-0 z-[1] bg-[color:rgba(192,57,90,0.12)]" : "",
                ].join(" ")}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {layout.rows.map((row, rowIndex) => (
            <tr key={`row-${rowIndex}`} className="bg-surface-primary/80 odd:bg-surface-elevated/70">
              {layout.headers.map((header, cellIndex) => {
                const value = row[cellIndex]?.trim() ?? "";
                return (
                  <td
                    key={`${header}-${cellIndex}-${rowIndex}`}
                    className={[
                      "border-b border-border-subtle px-4 py-3 align-top text-[15px] text-content-primary",
                      cellIndex === 0 ? "sticky left-0 bg-inherit font-bold" : "",
                    ].join(" ")}
                  >
                    {layout.formulaColumns.includes(cellIndex) || looksLikeGrammarFormula(value)
                      ? <HighlightFormula value={value} />
                      : value || <span className="text-content-muted">-</span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MatrixMobile({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="space-y-3 sm:hidden">
      {layout.rows.map((row, rowIndex) => {
        const primaryValue = getPrimaryValue(layout, row, rowIndex);

        return (
          <article key={`${primaryValue}-${rowIndex}`} className="rounded-[24px] border border-border-subtle bg-surface-primary/80 p-4">
            <PrimaryCardHeader
              title={primaryValue}
              label={layout.headers[layout.primaryColumn]}
            />

            <div className="mt-3 space-y-2">
              {layout.headers.map((header, cellIndex) => {
                const value = row[cellIndex]?.trim() ?? "";
                if (!value || cellIndex === layout.primaryColumn) {
                  return null;
                }

                return (
                  <div key={`${header}-${cellIndex}-${rowIndex}`} className="rounded-2xl border border-border-subtle bg-surface-elevated/90 px-3.5 py-3">
                    <FieldEyebrow accent>{header}</FieldEyebrow>
                    <div className="mt-2 text-[15px] leading-relaxed text-content-primary">
                      {layout.formulaColumns.includes(cellIndex) || looksLikeGrammarFormula(value)
                        ? <HighlightFormula value={value} />
                        : value}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MatrixTable({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <>
      <MatrixMobile layout={layout} />
      <MatrixDesktop layout={layout} />
    </>
  );
}

export default function GrammarAdaptiveTable({ table, section, visibleRowIndex }: Props) {
  const layout = useGrammarTableLayout(table, section);
  const hasExplicitRow = typeof visibleRowIndex === "number" && visibleRowIndex >= 0;
  const safeRowIndex = hasExplicitRow
    ? Math.min(visibleRowIndex, Math.max(layout.rows.length - 1, 0))
    : 0;
  const visibleLayout = hasExplicitRow
    ? { ...layout, rows: layout.rows[safeRowIndex] ? [layout.rows[safeRowIndex]] : [] }
    : layout;

  if (visibleLayout.variant === "pattern-deck") {
    return <PatternDeck layout={visibleLayout} />;
  }

  if (visibleLayout.variant === "concept-panels") {
    return <ConceptPanels layout={visibleLayout} />;
  }

  if (visibleLayout.variant === "matrix-table") {
    return <MatrixTable layout={visibleLayout} />;
  }

  return <ContrastCards layout={visibleLayout} />;
}