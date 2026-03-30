import { RED_ICON_FILTER } from "@/features/library/utils/vocabularyCardConfig";

const WHITE_ICON_FILTER = "brightness(0) invert(1)";

export interface VocabThumbnailProps {
  thumbnail: string;
  gradient: string;
  size?: "lg" | "sm";
  iconColor?: "red" | "white";
}

function isUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Icon thumbnail for vocabulary cards.
 */
export function VocabThumbnail({
  thumbnail,
  gradient,
  size = "sm",
  iconColor = "red",
}: VocabThumbnailProps) {
  const isIconUrl = isUrl(thumbnail);
  const charLen = !isIconUrl ? thumbnail.replace(/\s/g, "").length : 0;

  const dim = size === "lg" ? "h-14 w-14" : "h-11 w-11";

  const base = [
    "shrink-0 flex items-center justify-center rounded-2xl transition-colors duration-300",
    dim,
  ].join(" ");

  // ── URL icon ──────────────────────────────────────────────────────────────
  if (isIconUrl) {
    const imgDim = size === "lg" ? "h-8 w-8" : "h-6 w-6";
    const bgClass =
      iconColor === "white"
        ? "bg-white/15"
        : "bg-[#993331]/8 group-hover:bg-[#993331]/14";
    const filterStyle =
      iconColor === "white" ? WHITE_ICON_FILTER : RED_ICON_FILTER;

    return (
      <div className={[base, bgClass].join(" ")}>
        <img
          src={thumbnail}
          alt=""
          className={[imgDim, "object-contain"].join(" ")}
          style={{ filter: filterStyle }}
          loading="lazy"
        />
      </div>
    );
  }

  // ── Text: 1 char ──────────────────────────────────────────────────────────
  if (charLen <= 1) {
    const textSize = size === "lg" ? "text-[28px]" : "text-[18px]";
    return (
      <div
        className={[
          base,
          "overflow-hidden bg-gradient-to-br font-bold text-white shadow-lg",
          textSize,
          gradient,
        ].join(" ")}
      >
        {thumbnail}
      </div>
    );
  }

  // ── Text: 2 chars – forced single line to prevent wrapping ────────────────
  if (charLen === 2) {
    const textSize = size === "lg" ? "text-[20px]" : "text-[14px]";
    return (
      <div
        className={[
          base,
          "overflow-hidden bg-gradient-to-br font-bold text-white shadow-lg",
          textSize,
          gradient,
        ].join(" ")}
      >
        <span className="whitespace-nowrap">{thumbnail}</span>
      </div>
    );
  }

  // ── Text: 3+ chars ────────────────────────────────────────────────────────
  const textSize = size === "lg" ? "text-[11px]" : "text-[9px]";
  return (
    <div
      className={[
        base,
        "overflow-hidden bg-gradient-to-br font-bold text-white shadow-lg",
        "px-1 py-0.5",
        textSize,
        gradient,
      ].join(" ")}
    >
      <span className="line-clamp-3 w-full break-all text-center leading-tight">
        {thumbnail}
      </span>
    </div>
  );
}
