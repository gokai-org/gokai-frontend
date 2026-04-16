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
      "text-[2.5px] font-black uppercase tracking-[0.16em]",
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
    <span className="inline-flex flex-wrap items-center gap-x-[1px] gap-y-[1px]">
      {parts.map((part, index) => {
        if (/^S\d$/.test(part)) {
          return (
            <span
              key={`${part}-${index}`}
              className="rounded-full border border-border-subtle bg-surface-secondary px-[2px] py-0 text-[3.5px] font-black uppercase tracking-[0.18em] text-content-secondary"
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
      className="rounded-[3px] border border-border-subtle bg-surface-elevated/90 p-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.03)]"
    >
      <FieldEyebrow accent>{header}</FieldEyebrow>
      <div className="mt-[1px] text-[3.5px] font-semibold leading-[1.3] text-content-primary">
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
      <div className="rounded-[4px] border border-[var(--accent)]/12 bg-[var(--accent-subtle)] px-[3px] py-[2px]">
      {label ? <FieldEyebrow accent>{label}</FieldEyebrow> : null}
      <h4 className="text-[3.5px] font-black leading-[1.05] text-content-primary">
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
    <div className="space-y-[2px]">
      {layout.rows.map((row, index) => {
        const primaryValue = getPrimaryValue(layout, row, index);

        return (
          <article key={`${primaryValue}-${index}`} className="overflow-hidden rounded-[4px] border border-border-subtle bg-surface-primary/70">
            <div className="space-y-1 p-[3px]">
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
    <div className="grid gap-[2px] sm:grid-cols-2">
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
          <article key={`${primaryValue}-${index}`} className="rounded-[4px] border border-border-subtle bg-gradient-to-br from-surface-elevated via-surface-elevated to-surface-secondary p-[3px] shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <PrimaryCardHeader
              title={primaryValue}
              label={layout.headers[layout.primaryColumn]}
            />

            <div className="mt-[3px] grid gap-[2px] sm:grid-cols-2">
              {secondaryEntries.map((entry) => (
                <div key={`${entry.header}-${entry.cellIndex}`} className="rounded-[3px] border border-border-subtle bg-surface-primary/80 px-[3px] py-[2px]">
                  <FieldEyebrow accent>{entry.header}</FieldEyebrow>
                  <div className="text-[5px] leading-relaxed text-content-primary">
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
    <div className="rounded-[3px] border border-border-subtle bg-surface-primary/80 p-[3px] shadow-[0_4px_14px_rgba(0,0,0,0.03)]">
      <FieldEyebrow accent>{title}</FieldEyebrow>
      <div className="mt-[1px] text-[3.5px] leading-[1.8] text-content-secondary">{children}</div>
    </div>
  );
}

function ConceptPanels({ layout }: { layout: ResolvedGrammarTableLayout }) {
  return (
    <div className="space-y-[2px]">
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
          <article key={`${primaryValue}-${index}`} className="overflow-hidden rounded-[4px] border border-border-subtle bg-gradient-to-br from-surface-elevated via-surface-elevated to-surface-secondary">
            <div className="space-y-1 p-[3px]">
              <PrimaryCardHeader
                title={primaryValue}
                label={layout.headers[layout.primaryColumn]}
              />

              <div className="grid gap-[2px] sm:grid-cols-2">
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
    <div className="hidden overflow-x-auto rounded-[4px] border border-border-subtle sm:block">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr className="bg-[var(--accent-subtle)]">
            {layout.headers.map((header, index) => (
              <th
                key={`${header}-${index}`}
                className={[
                  "border-b border-border-subtle px-[3px] py-[1.5px] text-[2.5px] font-black uppercase tracking-[0.16em] text-[var(--accent)]",
                  index === 0 ? "sticky left-0 z-[1] bg-[color:rgba(153,51,49,0.12)]" : "",
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
                      "border-b border-border-subtle px-[3px] py-[1.5px] align-top text-[3.5px] text-content-primary",
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
          <article key={`${primaryValue}-${rowIndex}`} className="rounded-[4px] border border-border-subtle bg-surface-primary/80 p-[3px]">
            <PrimaryCardHeader
              title={primaryValue}
              label={layout.headers[layout.primaryColumn]}
            />

            <div className="mt-1 space-y-[2px]">
              {layout.headers.map((header, cellIndex) => {
                const value = row[cellIndex]?.trim() ?? "";
                if (!value || cellIndex === layout.primaryColumn) {
                  return null;
                }

                return (
                  <div key={`${header}-${cellIndex}-${rowIndex}`} className="rounded-[3px] border border-border-subtle bg-surface-elevated/90 px-[3px] py-[2px]">
                    <FieldEyebrow accent>{header}</FieldEyebrow>
                    <div className="text-[5px] leading-relaxed text-content-primary">
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