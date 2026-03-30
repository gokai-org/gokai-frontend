import { ChevronRight } from "lucide-react";
import { VocabThumbnail } from "@/features/library/components/VocabThumbnail";
import type { VariantConfig } from "@/features/library/utils/vocabularyCardConfig";

// ─── Shared props ─────────────────────────────────────────────────────────────

export interface LayoutProps {
  title: string;
  subtitle?: string;
  thumbnail: string;
  hasOnClick: boolean;
  config: VariantConfig;
  /** Tailwind transition class injected by useCardAnimation — empty when animations off. */
  hoverTransition: string;
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

// ─── GradientCardLayout ───────────────────────────────────────────────────────

/**
 * Layout for **theme** and **subtheme** cards.
 *
 * Default state: white card with coloured thumbnail + tinted badge.
 * Hover state: full gradient background floods the card with a smooth
 * transition (opacity-0 → opacity-100 overlay), text turns white,
 * badge becomes glass-morphism, decorative character appears.
 */
export function GradientCardLayout({
  title,
  subtitle,
  thumbnail,
  hasOnClick,
  config,
  hoverTransition,
}: LayoutProps) {
  const decorChar = isUrl(thumbnail) ? "語" : thumbnail.slice(0, 2);

  return (
    <>
      {/* ── Gradient overlay – invisible by default, full on hover ───── */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
          hoverTransition,
          config.cardGradient,
        ].join(" ")}
      />

      {/* ── Decorative background character ─────────────────────────── */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span
          className={[
            "-translate-y-2 translate-x-6 text-[100px] font-black leading-none",
            "text-[#993331]/[0.06] group-hover:text-white/[0.08]",
            hoverTransition,
          ].join(" ")}
        >
          {decorChar}
        </span>
      </span>

      {/* ── Bottom vignette – only visible on hover ──────────────────── */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[24px]",
          "bg-gradient-to-t from-black/30 to-transparent",
          "opacity-0 group-hover:opacity-100",
          hoverTransition,
        ].join(" ")}
      />

      {/* ── Top row: thumbnail ────────────────────────────────────────── */}
      <div className="relative z-10 mb-4">
        <div
          className={[
            "inline-block rounded-2xl ring-2 ring-transparent",
            "group-hover:scale-110 group-hover:ring-white/25 group-hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.35)]",
            hoverTransition,
          ].join(" ")}
        >
          <VocabThumbnail
            thumbnail={thumbnail}
            gradient={config.thumbGradient}
            size="lg"
            iconColor="white"
          />
        </div>
      </div>

      {/* ── Flex spacer ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex-1" />

      {/* ── Bottom text block ────────────────────────────────────────── */}
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

        {hasOnClick && (
          <div className="mt-2.5 flex justify-end">
            <ChevronRight
              className={[
                "h-4 w-4 text-[#993331]/30 group-hover:translate-x-0.5 group-hover:text-white/75",
                hoverTransition,
              ].join(" ")}
            />
          </div>
        )}
      </div>
    </>
  );
}

// ─── WordCardLayout ───────────────────────────────────────────────────────────

/**
 * Vertical / portrait layout for **word** cards.
 *
 * Structure (top to bottom):
 *   • Gradient overlay (opacity-0 → 1 on hover)
 *   • Large decorative icon/character behind content
 *   • Bottom vignette on hover
 *   • Small coloured thumbnail (top-left)
 *   • Flex spacer
 *   • Title + subtitle (bottom)
 */
export function WordCardLayout({
  title,
  subtitle,
  thumbnail,
  hasOnClick,
  config,
  hoverTransition,
}: LayoutProps) {
  const iconIsUrl = isUrl(thumbnail);

  return (
    <>
      {/* ── Gradient overlay ─────────────────────────────────────── */}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
          hoverTransition,
          config.cardGradient,
        ].join(" ")}
      />

      {/* ── Decorative background icon / character ───────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[24px]"
      >
        {iconIsUrl ? (
          <img
            src={thumbnail}
            alt=""
            className={[
              "h-[58%] w-[58%] -translate-y-4 object-contain",
              "opacity-[0.30] group-hover:opacity-[0.40] group-hover:scale-110",
              hoverTransition,
            ].join(" ")}
            style={{ filter: "invert(22%) sepia(58%) saturate(900%) hue-rotate(328deg) brightness(75%) contrast(95%)" }}
          />
        ) : (
          <span
            className={[
              "-translate-y-4 text-[75px] font-black leading-none select-none",
              "text-[#993331]/[0.22] group-hover:text-white/[0.16] group-hover:scale-110",
              hoverTransition,
            ].join(" ")}
          >
            {thumbnail.slice(0, 2)}
          </span>
        )}
      </div>

      {/* ── Bottom vignette ──────────────────────────────────────── */}
      <div
        className={[
          "pointer-events-none absolute inset-x-0 bottom-0 h-28 rounded-b-[24px]",
          "bg-gradient-to-t from-black/30 to-transparent",
          "opacity-0 group-hover:opacity-100",
          hoverTransition,
        ].join(" ")}
      />

      {/* ── Flex spacer ──────────────────────────────────────────── */}
      <div className="relative z-10 flex-1" />

      {/* ── Bottom text block ────────────────────────────────────── */}
      <div className="relative z-10 mt-3">
        <h3
          className={[
            "line-clamp-2 text-[15px] font-black leading-tight",
            "text-gray-900 group-hover:text-white",
            hoverTransition,
          ].join(" ")}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            className={[
              "mt-1 line-clamp-2 text-[11px] font-medium",
              "text-gray-400 group-hover:text-white/60",
              hoverTransition,
            ].join(" ")}
          >
            {subtitle}
          </p>
        )}

        {hasOnClick && (
          <div className="mt-2.5 flex justify-end">
            <ChevronRight
              className={[
                "h-4 w-4 text-[#993331]/30 group-hover:translate-x-0.5 group-hover:text-white/75",
                hoverTransition,
              ].join(" ")}
            />
          </div>
        )}
      </div>
    </>
  );
}

