"use client";

import { Fragment, useMemo } from "react";
import { LockKeyhole } from "lucide-react";
import type { Kana } from "@/features/kana/types";
import { ScriptCard } from "@/features/library/components/ScriptCard";
import {
  hiraganaToScriptCard,
  katakanaToScriptCard,
} from "@/features/library/utils/libraryMappers";
import {
  PHONETIC_ROWS,
  PHONETIC_COLS,
  DAKUTEN_ROW_KEYS,
  buildPhoneticTable,
} from "@/features/library/utils/kanaPhoneticMap";

// ─── Variant color tokens ─────────────────────────────────────────────────────

const VARIANT_COLORS = {
  hiragana: {
    accent:        "#7B3F8A",
    accentLight:   "rgba(123,63,138,0.09)",
    accentBorder:  "rgba(123,63,138,0.22)",
    accentCellBg:  "rgba(123,63,138,0.025)",
  },
  katakana: {
    accent:        "#1B5078",
    accentLight:   "rgba(27,80,120,0.09)",
    accentBorder:  "rgba(27,80,120,0.22)",
    accentCellBg:  "rgba(27,80,120,0.025)",
  },
} as const;

type VariantColors = (typeof VARIANT_COLORS)[keyof typeof VARIANT_COLORS];

// Abbreviated row labels for mobile
const ROW_SHORT: Record<string, string> = {
  vowels: "Voc",
  k: "K",  s: "S",  t: "T",  n: "N",  h: "H",
  m: "M",  y: "Y",  r: "R",  w: "W",  "n-solo": "N",
  g: "G",  z: "Z",  d: "D",  b: "B",  p: "P",
};

// ─── Public API ───────────────────────────────────────────────────────────────

export interface KanaPhoneticGridProps {
  kanas: Kana[];
  variant: "hiragana" | "katakana";
  lockedIds: ReadonlySet<string>;
  newlyUnlockedIds: ReadonlySet<string>;
  favoriteIds: ReadonlySet<string>;
  onKanaClick: (kana: Kana) => void;
  onFavoriteToggle: (id: string) => void;
}

// ─── Desktop sub-components ───────────────────────────────────────────────────

function DColHeader({ label, c }: { label: string; c: VariantColors }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border px-2 py-2"
      style={{ background: c.accentLight, borderColor: c.accentBorder }}
    >
      <span
        className="text-[11px] font-black uppercase tracking-[0.2em]"
        style={{ color: c.accent }}
      >
         {label}
      </span>
    </div>
  );
}

function DRowLabel({
  label,
  isDakuten,
  c,
}: {
  label: string;
  isDakuten: boolean;
  c: VariantColors;
}) {
  return (
    <div
      className={[
        "flex w-20 shrink-0 items-center justify-center rounded-xl border px-1 py-2",
        isDakuten ? "border-border-subtle bg-surface-secondary" : "",
      ].join(" ")}
      style={!isDakuten ? { background: c.accentLight, borderColor: c.accentBorder } : undefined}
    >
      <span
        className="text-center text-[10px] font-black uppercase leading-tight tracking-[0.15em] text-content-secondary"
        style={!isDakuten ? { color: c.accent } : undefined}
      >
        {label}
      </span>
    </div>
  );
}

function DEmptyCell() {
  return (
    <div className="min-h-[190px] rounded-[24px] border border-dashed border-border-subtle/30 bg-surface-primary/20" />
  );
}

function DDakutenDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="h-px flex-1 bg-border-subtle" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
        Consonantes Sonoras
      </span>
      <div className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

// ─── Mobile sub-components ────────────────────────────────────────────────────

function MColHeader({ label, c }: { label: string; c: VariantColors }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg border py-1.5"
      style={{ background: c.accentLight, borderColor: c.accentBorder }}
    >
      <span
        className="text-[9px] font-black uppercase tracking-wide"
        style={{ color: c.accent }}
      >
        {label}
      </span>
    </div>
  );
}

function MRowLabel({
  label,
  isDakuten,
  c,
}: {
  label: string;
  isDakuten: boolean;
  c: VariantColors;
}) {
  return (
    <div
      className={[
        "flex items-center justify-center rounded-lg border",
        isDakuten ? "border-border-subtle bg-surface-secondary" : "",
      ].join(" ")}
      style={!isDakuten ? { background: c.accentLight, borderColor: c.accentBorder } : undefined}
    >
      <span
        className="text-center text-[8px] font-black uppercase leading-tight text-content-secondary"
        style={!isDakuten ? { color: c.accent } : undefined}
      >
        {label}
      </span>
    </div>
  );
}

function MiniCell({
  kana,
  c,
  isLocked,
  onClick,
}: {
  kana: Kana;
  c: VariantColors;
  isLocked: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={[
        "group relative flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border py-2 text-center transition-all duration-150 select-none",
        isLocked
          ? "cursor-default border-border-subtle/40 bg-surface-secondary/50 opacity-55"
          : "active:scale-95",
      ].join(" ")}
      style={
        !isLocked
          ? { background: c.accentCellBg, borderColor: c.accentBorder, minHeight: "58px" }
          : { minHeight: "58px" }
      }
    >
      {isLocked ? (
        <LockKeyhole size={13} className="text-content-muted" />
      ) : (
        <>
          <span
            className="text-xl font-black leading-none"
            style={{ color: c.accent }}
          >
            {kana.symbol}
          </span>
          <span className="text-[7px] font-bold uppercase leading-none text-content-muted">
            {kana.romaji}
          </span>
        </>
      )}
    </button>
  );
}

function MEmptyCell() {
  return (
    <div
      className="rounded-xl border border-dashed border-border-subtle/25 bg-surface-primary/10"
      style={{ minHeight: "58px" }}
    />
  );
}

function MDakutenDivider() {
  return (
    <div
      className="flex items-center gap-2 py-0.5"
      style={{ gridColumn: "1 / -1" }}
    >
      <div className="h-px flex-1 bg-border-subtle" />
      <span className="text-[7px] font-bold uppercase tracking-widest text-content-muted">
        Sonoras
      </span>
      <div className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}

// ─── KanaPhoneticGrid ─────────────────────────────────────────────────────────

export function KanaPhoneticGrid({
  kanas,
  variant,
  lockedIds,
  newlyUnlockedIds,
  favoriteIds,
  onKanaClick,
  onFavoriteToggle,
}: KanaPhoneticGridProps) {
  const table = useMemo(() => buildPhoneticTable(kanas), [kanas]);
  const toScriptCard = variant === "hiragana" ? hiraganaToScriptCard : katakanaToScriptCard;
  const c = VARIANT_COLORS[variant];

  const presentRows = useMemo(
    () => PHONETIC_ROWS.filter((row) => table.has(row.key)),
    [table],
  );

  let cardIndex = 0;

  return (
    <div className="w-full">
      {/* ══════════════════════════════════════════════════════════════
          DESKTOP (lg+): full-width CSS grid, full ScriptCard
      ══════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:block w-full pb-4">
        <div
          className="grid gap-2 w-full"
          style={{ gridTemplateColumns: "5rem repeat(5, minmax(0, 1fr))" }}
        >
          {/* Column headers */}
          <div aria-hidden="true" />
          {PHONETIC_COLS.map((col) => (
            <DColHeader key={col} label={col} c={c} />
          ))}

          {presentRows.map((row, rowIdx) => {
            const isDakuten = DAKUTEN_ROW_KEYS.has(row.key);
            const prevRowKey = presentRows[rowIdx - 1]?.key;
            const showDivider =
              isDakuten && prevRowKey !== undefined && !DAKUTEN_ROW_KEYS.has(prevRowKey);

            return (
              <Fragment key={row.key}>
                {showDivider && (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <DDakutenDivider />
                  </div>
                )}

                <DRowLabel label={row.label} isDakuten={isDakuten} c={c} />

                {([0, 1, 2, 3, 4] as const).map((colIndex) => {
                  const kana = table.get(row.key)?.get(colIndex);
                  if (!kana) return <DEmptyCell key={colIndex} />;
                  const isLocked = lockedIds.has(kana.id);
                  const idx = cardIndex++;
                  return (
                    <ScriptCard
                      key={kana.id}
                      {...toScriptCard(kana, favoriteIds.has(kana.id))}
                      index={idx}
                      locked={isLocked}
                      unlocking={newlyUnlockedIds.has(kana.id)}
                      onClick={isLocked ? undefined : () => onKanaClick(kana)}
                      onFavoriteToggle={isLocked ? undefined : onFavoriteToggle}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MOBILE / TABLET (< lg): full-width compact mini-cells
      ══════════════════════════════════════════════════════════════ */}
      <div className="block lg:hidden w-full pb-4">
        <div
          className="grid gap-1.5 w-full"
          style={{ gridTemplateColumns: "1.75rem repeat(5, minmax(0, 1fr))" }}
        >
          {/* Column headers */}
          <div aria-hidden="true" />
          {PHONETIC_COLS.map((col) => (
            <MColHeader key={col} label={col} c={c} />
          ))}

          {presentRows.map((row, rowIdx) => {
            const isDakuten = DAKUTEN_ROW_KEYS.has(row.key);
            const prevRowKey = presentRows[rowIdx - 1]?.key;
            const showDivider =
              isDakuten && prevRowKey !== undefined && !DAKUTEN_ROW_KEYS.has(prevRowKey);
            const shortLabel = ROW_SHORT[row.key] ?? row.label.slice(0, 3);

            return (
              <Fragment key={row.key}>
                {showDivider && <MDakutenDivider />}

                <MRowLabel label={shortLabel} isDakuten={isDakuten} c={c} />

                {([0, 1, 2, 3, 4] as const).map((colIndex) => {
                  const kana = table.get(row.key)?.get(colIndex);
                  if (!kana)
                    return <MEmptyCell key={`empty-${row.key}-${colIndex}`} />;
                  const isLocked = lockedIds.has(kana.id);
                  return (
                    <MiniCell
                      key={kana.id}
                      kana={kana}
                      c={c}
                      isLocked={isLocked}
                      onClick={isLocked ? undefined : () => onKanaClick(kana)}
                    />
                  );
                })}
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
