import Image, { type ImageLoaderProps } from "next/image";
import { ChevronRight } from "lucide-react";
import { VocabThumbnail } from "@/features/library/components/VocabThumbnail";
import type { VariantConfig } from "@/features/library/utils/vocabularyCardConfig";

const passthroughImageLoader = ({ src }: ImageLoaderProps) => src;

// ─── Shared props ─────────────────────────────────────────────────────────────

export interface LayoutProps {
  title: string;
  subtitle?: string;
  thumbnail: string;
  hasOnClick: boolean;
  hoverEnabled: boolean;
  config: VariantConfig;
  actionAlignment?: "start" | "end";
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
 * Hover state: only subtle border/motion feedback; visual treatment stays flat.
 */
export function GradientCardLayout({
  title,
  subtitle,
  thumbnail,
  hasOnClick,
  hoverEnabled,
  config,
  hoverTransition,
}: LayoutProps) {
  const decorChar = isUrl(thumbnail) ? "語" : thumbnail.slice(0, 2);

  return (
    <>
      {hoverEnabled && (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 z-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
            hoverTransition,
            config.cardGradient,
          ].join(" ")}
        />
      )}

      {/* ── Decorative background character ─────────────────────────── */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
      >
        <span
          className={[
            "-translate-y-2 translate-x-6 text-[100px] font-black leading-none",
            "text-accent/[0.05] group-hover:text-white/10",
            hoverTransition,
          ].join(" ")}
        >
          {decorChar}
        </span>
      </span>

      {/* ── Top row: thumbnail ────────────────────────────────────────── */}
      <div className="relative z-10 mb-4">
        <div
          className={[
            "inline-block rounded-2xl",
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
            "text-content-primary group-hover:text-white",
            hoverTransition,
          ].join(" ")}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            className={[
              "mt-1 line-clamp-1 text-[12px] font-medium",
              "text-content-muted group-hover:text-white/72",
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
                "h-4 w-4 text-accent/30 group-hover:translate-x-0.5 group-hover:text-accent/55",
                "group-hover:text-white/85",
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
 *   • Large decorative icon/character behind content
 *   • Small coloured thumbnail (top-left)
 *   • Flex spacer
 *   • Title + subtitle (bottom)
 */
export function WordCardLayout({
  title,
  subtitle,
  thumbnail,
  hasOnClick,
  hoverEnabled,
  config,
  actionAlignment = "end",
  hoverTransition,
}: LayoutProps) {
  const iconIsUrl = isUrl(thumbnail);

  return (
    <>
      {hoverEnabled && (
        <span
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 z-0 rounded-[24px] bg-gradient-to-br opacity-0 group-hover:opacity-100",
            hoverTransition,
            config.cardGradient,
          ].join(" ")}
        />
      )}

      {/* ── Decorative background icon / character ───────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[24px]"
      >
        {iconIsUrl ? (
          <div className="relative h-[58%] w-[58%] -translate-y-4">
            <Image
              loader={passthroughImageLoader}
              unoptimized
              src={thumbnail}
              alt=""
              fill
              sizes="(max-width: 640px) 140px, 220px"
              className={[
                "object-contain",
                "opacity-[0.22]",
                "group-hover:opacity-[0.3]",
                hoverTransition,
              ].join(" ")}
              style={{
                filter:
                  "invert(22%) sepia(58%) saturate(900%) hue-rotate(328deg) brightness(75%) contrast(95%)",
              }}
            />
          </div>
        ) : (
          <span
            className={[
              "-translate-y-4 text-[75px] font-black leading-none select-none",
              "text-accent/[0.16] group-hover:text-white/18",
              hoverTransition,
            ].join(" ")}
          >
            {thumbnail.slice(0, 2)}
          </span>
        )}
      </div>

      {/* ── Flex spacer ──────────────────────────────────────────── */}
      <div className="relative z-10 flex-1" />

      {/* ── Bottom text block ────────────────────────────────────── */}
      <div className="relative z-10 mt-3">
        <h3
          className={[
            "line-clamp-2 text-[15px] font-black leading-tight",
            "text-content-primary group-hover:text-white",
            hoverTransition,
          ].join(" ")}
        >
          {title}
        </h3>

        {subtitle && (
          <p
            className={[
              "mt-1 line-clamp-2 text-[11px] font-medium",
              "text-content-muted group-hover:text-white/72",
              hoverTransition,
            ].join(" ")}
          >
            {subtitle}
          </p>
        )}

        {hasOnClick && (
          <div
            className={[
              "mt-2.5 flex",
              actionAlignment === "start" ? "justify-start" : "justify-end",
            ].join(" ")}
          >
            <ChevronRight
              className={[
                "h-4 w-4 text-accent/30 group-hover:translate-x-0.5 group-hover:text-accent/55",
                "group-hover:text-white/85",
                hoverTransition,
              ].join(" ")}
            />
          </div>
        )}
      </div>
    </>
  );
}
