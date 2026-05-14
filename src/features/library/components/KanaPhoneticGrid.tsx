"use client";

import { motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { LockedStateBadge } from "@/shared/ui/LockedStateIndicator";
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
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

// ─── Variant color tokens ─────────────────────────────────────────────────────

const VARIANT_COLORS = {
  hiragana: {
    accent:        "#7B3F8A",
    accentLight:   "rgba(123,63,138,0.14)",
    accentBorder:  "rgba(123,63,138,0.34)",
    accentCellBg:  "rgba(123,63,138,0.025)",
    unlockRgba:    "123,63,138",
  },
  katakana: {
    accent:        "#1B5078",
    accentLight:   "rgba(27,80,120,0.14)",
    accentBorder:  "rgba(27,80,120,0.34)",
    accentCellBg:  "rgba(27,80,120,0.025)",
    unlockRgba:    "27,80,120",
  },
} as const;

const GOLD_COLORS = {
  accent:        "#D4A843",
  accentLight:   "rgba(212,168,67,0.16)",
  accentBorder:  "rgba(212,168,67,0.36)",
  accentCellBg:  "rgba(212,168,67,0.025)",
  unlockRgba:    "212,168,67",
} as const;

type VariantColors = {
  accent: string;
  accentLight: string;
  accentBorder: string;
  accentCellBg: string;
  unlockRgba: string;
};

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
  highlightedSymbol?: string | null;
  lockedIds: ReadonlySet<string>;
  newlyUnlockedIds: ReadonlySet<string>;
  favoriteIds: ReadonlySet<string>;
  onKanaClick: (kana: Kana) => void;
  onFavoriteToggle?: (id: string) => void;
}

function isElementInsideViewport(rect: DOMRect, padding = 20) {
  return (
    rect.top >= padding &&
    rect.left >= padding &&
    rect.bottom <= window.innerHeight - padding &&
    rect.right <= window.innerWidth - padding
  );
}

function HighlightFrame({
  highlighted,
  pulse,
  open,
  onAccept,
  onReturn,
  title,
  description,
  children,
  registerRef,
}: {
  highlighted: boolean;
  pulse: boolean;
  open: boolean;
  onAccept: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onReturn: (event: React.MouseEvent<HTMLButtonElement>) => void;
  title: string;
  description: string;
  children: React.ReactNode;
  registerRef?: (element: HTMLDivElement | null) => void;
}) {
  return (
    <motion.div
      ref={registerRef}
      tabIndex={highlighted ? -1 : undefined}
      initial={false}
      animate={pulse ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={pulse ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.18 }}
      className={`relative outline-none ${highlighted ? "z-40" : "z-0"}`}
    >
      {highlighted ? (
        <>
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 rounded-[28px] border-2"
            animate={pulse ? {
              borderColor: [
                "rgba(var(--kana-highlight-rgb),0.32)",
                "rgba(var(--kana-highlight-rgb),0.7)",
                "rgba(var(--kana-highlight-rgb),0.32)",
              ],
              boxShadow: [
                "0 0 0 0 rgba(var(--kana-highlight-rgb),0.16)",
                "0 0 0 6px rgba(var(--kana-highlight-rgb),0.08)",
                "0 0 0 0 rgba(var(--kana-highlight-rgb),0.16)",
              ],
            } : {
              borderColor: "rgba(var(--kana-highlight-rgb),0.55)",
              boxShadow: "0 0 0 3px rgba(var(--kana-highlight-rgb),0.12)",
            }}
            transition={pulse ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[26px]"
            animate={pulse ? { opacity: [0.12, 0.24, 0.12] } : { opacity: 0.14 }}
            transition={pulse ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            style={{ background: "rgba(var(--kana-highlight-rgb),0.12)" }}
          />

          {open ? (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute left-1/2 top-[calc(100%+1rem)] z-50 w-[min(19rem,calc(100vw-2rem))] -translate-x-1/2 lg:top-auto lg:bottom-[calc(100%+1rem)]"
            >
              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-black/5 dark:border-slate-700 dark:bg-[#15161c] dark:shadow-[0_28px_70px_rgba(0,0,0,0.45)] dark:ring-white/10">
                <div className="relative overflow-hidden border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-700 dark:bg-[#15161c]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-full"
                    style={{
                      background: "linear-gradient(145deg, rgba(var(--kana-highlight-rgb),0.22), rgba(var(--kana-highlight-rgb),0.1) 45%, transparent 100%)",
                    }}
                  />
                  <div className="relative">
                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                    Tabla fonética
                    </p>
                    <p className="mt-1 text-base font-black text-slate-950 dark:text-slate-50">
                      {title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      {description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 bg-slate-50 px-4 py-3 dark:bg-[#111219]">
                  <button
                    type="button"
                    onClick={onAccept}
                    className="flex-1 rounded-2xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400 dark:border-slate-600 dark:bg-[#1a1c24] dark:text-slate-200 dark:hover:bg-[#222531] dark:focus-visible:ring-slate-500 dark:focus-visible:ring-offset-[#111219]"
                  >
                    Aceptar
                  </button>
                  <button
                    type="button"
                    onClick={onReturn}
                    className="flex-1 rounded-2xl border border-transparent bg-[color:var(--kana-highlight-accent)] px-3 py-2.5 text-sm font-black text-white transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--kana-highlight-accent)] dark:focus-visible:ring-offset-[#111219]"
                  >
                    Regresar
                  </button>
                </div>
              </div>
              <div className="pointer-events-none absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-l border-t border-slate-200 bg-white lg:top-auto lg:bottom-0 lg:translate-y-1/2 lg:border-l-0 lg:border-t-0 lg:border-r lg:border-b dark:border-slate-700 dark:bg-[#15161c]" />
            </motion.div>
          ) : null}
        </>
      ) : null}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ─── Desktop sub-components ───────────────────────────────────────────────────

function DColHeader({ label, c }: { label: string; c: VariantColors }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.32)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      style={{ background: c.accentLight, borderColor: c.accentBorder }}
    >
      <span
        className="text-[11px] font-black uppercase tracking-[0.2em]"
        style={{ color: c.accent, textShadow: "0 1px 0 rgba(255,255,255,0.18)" }}
      >
         {label}
      </span>
    </div>
  );
}

function DRowLabel({
  label,
  isDakuten,
  isMastered,
  c,
}: {
  label: string;
  isDakuten: boolean;
  isMastered: boolean;
  c: VariantColors;
}) {
  const useAccentStyle = !isDakuten || isMastered;

  return (
    <div
      className={[
        "flex w-20 shrink-0 items-center justify-center rounded-xl border px-1 py-2",
        !useAccentStyle ? "border-border-subtle bg-surface-secondary" : "",
      ].join(" ")}
      style={useAccentStyle ? { background: c.accentLight, borderColor: c.accentBorder } : undefined}
    >
      <span
        className="text-center text-[10px] font-black uppercase leading-tight tracking-[0.15em] text-content-secondary"
        style={useAccentStyle ? { color: c.accent } : undefined}
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
      className="flex items-center justify-center rounded-lg border py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.28)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
      style={{ background: c.accentLight, borderColor: c.accentBorder }}
    >
      <span
        className="text-[9px] font-black uppercase tracking-wide"
        style={{ color: c.accent, textShadow: "0 1px 0 rgba(255,255,255,0.16)" }}
      >
        {label}
      </span>
    </div>
  );
}

function MRowLabel({
  label,
  isDakuten,
  isMastered,
  c,
}: {
  label: string;
  isDakuten: boolean;
  isMastered: boolean;
  c: VariantColors;
}) {
  const useAccentStyle = !isDakuten || isMastered;

  return (
    <div
      className={[
        "flex items-center justify-center rounded-lg border",
        !useAccentStyle ? "border-border-subtle bg-surface-secondary" : "",
      ].join(" ")}
      style={useAccentStyle ? { background: c.accentLight, borderColor: c.accentBorder } : undefined}
    >
      <span
        className="text-center text-[8px] font-black uppercase leading-tight text-content-secondary"
        style={useAccentStyle ? { color: c.accent } : undefined}
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
  highlighted = false,
  animationsEnabled,
  unlocking = false,
  onClick,
}: {
  kana: Kana;
  c: VariantColors;
  isLocked: boolean;
  highlighted?: boolean;
  animationsEnabled: boolean;
  unlocking?: boolean;
  onClick?: () => void;
}) {
  const effectiveLocked = isLocked && !unlocking;
  const unlockSequenceDelay = 0;
  const unlockingOverlay = unlocking ? (
    <motion.div
      key="unlock-burst"
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center overflow-visible"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: unlockSequenceDelay + (animationsEnabled ? 2.05 : 0.9), duration: 0.4 }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-0 rounded-2xl"
          initial={{ opacity: 0.78 }}
          animate={{ opacity: 0 }}
          transition={{ delay: unlockSequenceDelay, duration: animationsEnabled ? 1.9 : 0.8 }}
          style={{
            background: `radial-gradient(circle, rgba(${c.unlockRgba},0.48) 0%, transparent 70%)`,
          }}
        />
        {animationsEnabled && (
          <>
            <motion.div
              className="absolute rounded-2xl border-2"
              initial={{ opacity: 0.92, scale: 0.52 }}
              animate={{ opacity: 0, scale: 1.48 }}
              transition={{ delay: unlockSequenceDelay, duration: 0.88, ease: [0.22, 1, 0.36, 1] }}
              style={{ inset: 0, borderColor: `rgba(${c.unlockRgba},0.52)` }}
            />
            <motion.div
              className="absolute rounded-2xl border"
              initial={{ opacity: 0.58, scale: 0.72 }}
              animate={{ opacity: 0, scale: 1.7 }}
              transition={{ delay: unlockSequenceDelay + 0.16, duration: 1.02, ease: [0.22, 1, 0.36, 1] }}
              style={{ inset: -4, borderColor: `rgba(${c.unlockRgba},0.28)` }}
            />
          </>
        )}
      </div>
      <motion.div
        className="relative z-10 rounded-full px-2.5 py-[4px]"
        style={{
          background: c.accent,
          boxShadow: `0 3px 12px rgba(${c.unlockRgba},0.52)`,
        }}
        initial={{ y: 10, opacity: 0, scale: 0.68 }}
        animate={
          animationsEnabled
            ? {
                y: [10, -2, -30, -38],
                opacity: [0, 1, 1, 0],
                scale: [0.68, 1.05, 1, 0.94],
              }
            : { y: -22, opacity: [0, 1, 0], scale: 1 }
        }
        transition={{
          delay: unlockSequenceDelay + 0.05,
          duration: animationsEnabled ? 1.9 : 0.9,
          times: animationsEnabled ? [0, 0.14, 0.68, 1] : [0, 0.3, 1],
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span className="text-[11px] font-black tracking-wide text-white">
          +5
        </span>
      </motion.div>
    </motion.div>
  ) : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={effectiveLocked}
      className={[
        "group relative flex w-full flex-col items-center justify-center gap-0.5 rounded-2xl border py-2 text-center transition-all duration-150 select-none",
        effectiveLocked
          ? "cursor-default border-border-subtle/40 bg-surface-secondary/50 opacity-55"
          : highlighted
            ? "active:scale-95"
            : "active:scale-95",
      ].join(" ")}
      style={
        !effectiveLocked
          ? { background: c.accentCellBg, borderColor: c.accentBorder, minHeight: "58px" }
          : { minHeight: "58px" }
      }
    >
      {unlockingOverlay}
      {effectiveLocked ? (
        <LockedStateBadge size="xs" />
      ) : (
        <motion.div
          initial={false}
          animate={
            unlocking
              ? {
                  scale: [0.94, 1.06, 1],
                  y: [6, -6, 0],
                  filter: [
                    "brightness(1)",
                    "brightness(1.18)",
                    "brightness(1)",
                  ],
                }
              : { scale: 1, y: 0, filter: "brightness(1)" }
          }
          transition={{
            delay: unlockSequenceDelay,
            duration: animationsEnabled ? 0.95 : 0.45,
            times: [0, 0.38, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          className="flex flex-col items-center gap-0.5"
        >
          <span
            className="text-xl font-black leading-none"
            style={{ color: c.accent }}
          >
            {kana.symbol}
          </span>
          <span className="text-[7px] font-bold uppercase leading-none text-content-muted">
            {kana.romaji}
          </span>
        </motion.div>
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
  highlightedSymbol,
  lockedIds,
  newlyUnlockedIds,
  favoriteIds,
  onKanaClick,
  onFavoriteToggle,
}: KanaPhoneticGridProps) {
  const table = useMemo(() => buildPhoneticTable(kanas), [kanas]);
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const toScriptCard = variant === "hiragana" ? hiraganaToScriptCard : katakanaToScriptCard;
  const mastered = useMasteredModules();
  const platformMotion = usePlatformMotion();
  const isMastered = mastered.has(variant);
  const c = isMastered ? GOLD_COLORS : VARIANT_COLORS[variant];
  const [highlightPromptOpen, setHighlightPromptOpen] = useState(Boolean(highlightedSymbol));
  const highlightedKana = useMemo(
    () => highlightedSymbol
      ? kanas.find((kana) => kana.symbol === highlightedSymbol) ?? null
      : null,
    [highlightedSymbol, kanas],
  );

  useEffect(() => {
    setHighlightPromptOpen(Boolean(highlightedSymbol));
  }, [highlightedSymbol]);

  useEffect(() => {
    if (!highlightedKana) {
      return;
    }

    const target = cellRefs.current[highlightedKana.id];
    if (!target) {
      return;
    }

    let cancelled = false;
    let frameId = 0;
    let timeoutId = 0;

    const alignHighlightedKana = (attempt: number) => {
      if (cancelled) {
        return;
      }

      const element = cellRefs.current[highlightedKana.id];

      if (!element) {
        return;
      }

      element.scrollIntoView({
        block: "center",
        inline: "center",
        behavior: attempt === 0 ? "auto" : "smooth",
      });

      const rect = element.getBoundingClientRect();

      if (!isElementInsideViewport(rect)) {
        const nextTop = Math.max(
          0,
          window.scrollY + rect.top - ((window.innerHeight - rect.height) / 2),
        );

        window.scrollTo({
          top: nextTop,
          behavior: attempt === 0 ? "auto" : "smooth",
        });
      }

      window.setTimeout(() => {
        element.focus({ preventScroll: true });
      }, 90);

      if (attempt < 2) {
        timeoutId = window.setTimeout(() => {
          frameId = window.requestAnimationFrame(() => {
            alignHighlightedKana(attempt + 1);
          });
        }, 180);
      }
    };

    frameId = window.requestAnimationFrame(() => {
      alignHighlightedKana(0);
    });

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, [highlightPromptOpen, highlightedKana]);

  const presentRows = useMemo(
    () => PHONETIC_ROWS.filter((row) => table.has(row.key)),
    [table],
  );

  const highlightAccent = c.accent;
  const highlightRgb = c.unlockRgba;
  const highlightTitle = highlightedKana
    ? `${highlightedKana.symbol} · ${variant === "hiragana" ? "Hiragana" : "Katakana"}`
    : "Punto de aprendizaje";
  const highlightDescription = highlightedKana
    ? `En este punto se aprende ${highlightedKana.symbol}. Aquí queda ubicado dentro de la tabla fonética para que lo reconozcas y lo repases más rápido.`
    : "En este punto se aprende este kana dentro de la tabla fonética.";

  const handleAcceptHighlight = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setHighlightPromptOpen(false);
  };

  const handleReturn = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (typeof window === "undefined") {
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.assign("/dashboard/graph");
  };

  let cardIndex = 0;
  let mobileCellIndex = 0;

  return (
    <div
      className="w-full"
      style={{
        ["--kana-highlight-accent" as string]: highlightAccent,
        ["--kana-highlight-rgb" as string]: highlightRgb,
      }}
    >
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

                <DRowLabel label={row.label} isDakuten={isDakuten} isMastered={isMastered} c={c} />

                {([0, 1, 2, 3, 4] as const).map((colIndex) => {
                  const kana = table.get(row.key)?.get(colIndex);
                  if (!kana) return <DEmptyCell key={colIndex} />;
                  const isLocked = lockedIds.has(kana.id);
                  const isHighlighted = highlightedKana?.id === kana.id;
                  const idx = cardIndex++;
                  return (
                    <HighlightFrame
                      key={kana.id}
                      highlighted={isHighlighted && highlightPromptOpen}
                      pulse={isHighlighted && highlightPromptOpen}
                      open={isHighlighted && highlightPromptOpen}
                      onAccept={handleAcceptHighlight}
                      onReturn={handleReturn}
                      title={highlightTitle}
                      description={highlightDescription}
                      registerRef={(element) => {
                        cellRefs.current[kana.id] = element;
                      }}
                    >
                      <ScriptCard
                        {...toScriptCard(kana, favoriteIds.has(kana.id))}
                        index={idx}
                        locked={isLocked}
                        unlocking={newlyUnlockedIds.has(kana.id)}
                        onClick={isLocked ? undefined : () => onKanaClick(kana)}
                        onFavoriteToggle={isLocked ? undefined : onFavoriteToggle}
                      />
                    </HighlightFrame>
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

                <MRowLabel label={shortLabel} isDakuten={isDakuten} isMastered={isMastered} c={c} />

                {([0, 1, 2, 3, 4] as const).map((colIndex) => {
                  const kana = table.get(row.key)?.get(colIndex);
                  if (!kana)
                    return <MEmptyCell key={`empty-${row.key}-${colIndex}`} />;
                  const isLocked = lockedIds.has(kana.id);
                  const isHighlighted = highlightedKana?.id === kana.id;
                  const idx = mobileCellIndex++;
                  return (
                    <HighlightFrame
                      key={kana.id}
                      highlighted={isHighlighted && highlightPromptOpen}
                      pulse={isHighlighted && highlightPromptOpen}
                      open={isHighlighted && highlightPromptOpen}
                      onAccept={handleAcceptHighlight}
                      onReturn={handleReturn}
                      title={highlightTitle}
                      description={highlightDescription}
                      registerRef={(element) => {
                        cellRefs.current[kana.id] = element;
                      }}
                    >
                      <MiniCell
                        kana={kana}
                        c={c}
                        isLocked={isLocked}
                        highlighted={isHighlighted}
                        animationsEnabled={platformMotion.shouldAnimate}
                        unlocking={newlyUnlockedIds.has(kana.id)}
                        onClick={isLocked ? undefined : () => onKanaClick(kana)}
                      />
                    </HighlightFrame>
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
