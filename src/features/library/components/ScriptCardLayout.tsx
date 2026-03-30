import type { ScriptCardConfig } from "@/features/library/utils/scriptCardConfig";

// ─── Favourite heart SVG ────────────────────────────────────────────────────

interface HeartProps {
  isFavorite: boolean;
  config: ScriptCardConfig;
  hoverTransition: string;
}

export function HeartIcon({ isFavorite, config, hoverTransition }: HeartProps) {
  return (
    <svg
      className={[
        "h-4 w-4",
        hoverTransition,
        isFavorite
          ? `fill-current ${config.heartColor} group-hover:text-white`
          : `text-gray-300 group-hover:text-white/70`,
      ].join(" ")}
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={isFavorite ? 0 : 2.5}
      fill={isFavorite ? "currentColor" : "none"}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

// ─── ScriptSymbolBox ──────────────────────────────────────────────────────────

interface ScriptSymbolBoxProps {
  symbol: string;
  gradient: string;
  hoverTransition: string;
}

export function ScriptSymbolBox({ symbol, gradient, hoverTransition }: ScriptSymbolBoxProps) {
  return (
    <div
      className={[
        "inline-flex h-14 w-14 items-center justify-center overflow-hidden",
        "rounded-2xl bg-gradient-to-br font-black text-white shadow-lg",
        "ring-2 ring-transparent",
        "group-hover:scale-110 group-hover:ring-white/25 group-hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)]",
        "text-[30px] leading-none",
        hoverTransition,
        gradient,
      ].join(" ")}
    >
      {symbol}
    </div>
  );
}

// ─── ScriptCardLayout ─────────────────────────────────────────────────────────

export interface ScriptCardLayoutProps {
  symbol: string;
  title: string;
  subtitle?: string;
  pointsBadge?: string;
  isFavorite: boolean;
  hasOnClick: boolean;
  hasFavoriteToggle: boolean;
  config: ScriptCardConfig;
  /** Tailwind transition class injected by useCardAnimation — empty when animations off. */
  hoverTransition: string;
  onFavoriteToggle?: () => void;
}

/**
 * Shared layout for Kanji, Hiragana and Katakana cards.
 */
export function ScriptCardLayout({
  symbol,
  title,
  subtitle,
  pointsBadge,
  isFavorite,
  hasFavoriteToggle,
  config,
  hoverTransition,
  onFavoriteToggle,
}: ScriptCardLayoutProps) {
  return (
    <>
      {/* ── Gradient overlay ─────────────────────────────────── */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
          hoverTransition,
          config.hoverGradient,
        ].join(" ")}
      />

      {/* ── Decorative oversized symbol in background ────────────── */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span
          className={[
            "-translate-y-1 translate-x-8 text-[96px] font-black leading-none",
            config.decorOpacity,
            hoverTransition,
          ].join(" ")}
        >
          {symbol}
        </span>
      </span>

      {/* ── Bottom vignette ─────────────────────────────────── */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[24px]",
          "bg-gradient-to-t from-black/30 to-transparent",
          "opacity-0 group-hover:opacity-100",
          hoverTransition,
        ].join(" ")}
      />

      {/* ── Top row: symbol box + points badge ─────────────────── */}
      <div className="relative z-10 mb-4 flex items-start justify-between gap-2">
        <ScriptSymbolBox
          symbol={symbol}
          gradient={config.thumbGradient}
          hoverTransition={hoverTransition}
        />

        {pointsBadge && (
          <span
            className={[
              "rounded-full border px-2 py-[3px] text-[10px] font-extrabold leading-none backdrop-blur-sm",
              hoverTransition,
              config.pointsBadge,
            ].join(" ")}
          >
            {pointsBadge}
          </span>
        )}
      </div>

      {/* ── Flex spacer ───────────────────────────────────────────── */}
      <div className="relative z-10 flex-1" />

      {/* ── Bottom: title + subtitle ────────────────────────────── */}
      <div className="relative z-10 mt-3">
        <h3
          className={[
            "line-clamp-2 text-[17px] font-black leading-tight",
            "text-gray-900 group-hover:text-white",
            hoverTransition,
          ].join(" ")}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            className={[
              "mt-1 line-clamp-1 text-[12px] font-medium",
              "text-gray-400 group-hover:text-white/60",
              hoverTransition,
            ].join(" ")}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* ── Favourite button ────────────────────────────────────── */}
      {hasFavoriteToggle && onFavoriteToggle && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
          className={[
            "absolute bottom-4 right-4 z-20 rounded-full border p-2 shadow-sm",
            "hover:scale-105 active:scale-95",
            hoverTransition,
            isFavorite
              ? `opacity-100 ${config.heartBg}`
              : "border-gray-100 bg-white opacity-0 group-hover:border-white/25 group-hover:bg-white/15 group-hover:opacity-100",
          ].join(" ")}
        >
          <HeartIcon
            isFavorite={isFavorite}
            config={config}
            hoverTransition={hoverTransition}
          />
        </button>
      )}
    </>
  );
}

