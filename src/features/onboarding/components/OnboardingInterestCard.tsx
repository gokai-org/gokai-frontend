"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { OnboardingInterest } from "@/features/onboarding/types";

const ONBOARDING_CARD_STYLES: {
  bg: string;
  text: string;
  badge: string;
  kanji: string;
  border: string;
}[] = [
  {
    bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
  {
    bg: "bg-accent/15 dark:bg-accent/20",
    text: "text-content-primary dark:text-white",
    badge: "bg-accent/15 dark:bg-accent/25",
    kanji: "text-accent dark:text-accent",
    border: "border-accent/20 dark:border-accent/25",
  },
  {
    bg: "bg-accent dark:bg-accent",
    text: "text-white",
    badge: "bg-white/15",
    kanji: "text-white",
    border: "border-white/10",
  },
  {
    bg: "bg-surface-secondary dark:bg-surface-secondary",
    text: "text-content-primary dark:text-white",
    badge: "bg-content-primary/10 dark:bg-white/10",
    kanji: "text-content-primary dark:text-white",
    border: "border-content-primary/10 dark:border-white/10",
  },
];

type OnboardingInterestCardProps = {
  interest: OnboardingInterest;
  index: number;
  total: number;
  isSelected: boolean;
  onClick: () => void;
  compact?: boolean;
  isResolving?: boolean;
};

export function OnboardingInterestCard({
  interest,
  index,
  total,
  isSelected,
  onClick,
  compact = false,
  isResolving = false,
}: OnboardingInterestCardProps) {
  const style = ONBOARDING_CARD_STYLES[index % ONBOARDING_CARD_STYLES.length];
  const unavailable = !interest.themeId;
  const disabled = isResolving || unavailable;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: compact ? 1.012 : 1.018, y: compact ? -2 : -4 }}
      whileTap={disabled ? undefined : { scale: 0.985 }}
      className={[
        compact
          ? "group relative flex h-full w-full min-h-[360px] sm:min-h-[430px] md:min-h-[500px] flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[26px] border text-left font-sans"
          : "group relative flex h-full w-full min-h-[360px] sm:min-h-[410px] md:min-h-[460px] lg:min-h-[520px] flex-col justify-between overflow-hidden rounded-[26px] sm:rounded-[30px] border text-left font-sans",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        compact
          ? "shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
          : "shadow-[0_12px_36px_rgba(0,0,0,0.08)]",
        disabled
          ? "cursor-not-allowed opacity-55 grayscale"
          : compact
            ? "hover:shadow-[0_18px_38px_rgba(153,51,49,0.13)]"
            : "hover:shadow-[0_26px_64px_rgba(153,51,49,0.12)]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60",
        style.bg,
        style.text,
        style.border,
        isSelected
          ? compact
            ? "ring-2 ring-accent shadow-[0_14px_30px_rgba(153,51,49,0.20)]"
            : "ring-2 ring-accent scale-[1.02] shadow-[0_22px_60px_rgba(153,51,49,0.20)]"
          : "",
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-70" />

      <div className="pointer-events-none absolute inset-0 flex items-end justify-start overflow-hidden pl-4 pb-5 sm:pl-5 sm:pb-6 lg:pl-5 lg:pb-6">
        <span
          className={[
            "font-black leading-none transition-all duration-500 select-none whitespace-pre-line",
            style.kanji,
            compact
              ? isSelected
                ? "text-[4.9rem] sm:text-[6rem] md:text-[7.25rem] opacity-[0.14] scale-105"
                : "text-[4.5rem] sm:text-[5.6rem] md:text-[6.75rem] opacity-[0.08]"
              : isSelected
                ? "text-[5.75rem] sm:text-[7.5rem] md:text-[8.75rem] lg:text-[13rem] opacity-[0.14] scale-105"
                : "text-[5.25rem] sm:text-[6.75rem] md:text-[8rem] lg:text-[12rem] opacity-[0.08]",
          ].join(" ")}
        >
          {interest.kanji.split("・").join("\n")}
        </span>
      </div>

      <div className={compact ? "relative z-10 p-4 sm:p-4.5 md:p-5" : "relative z-10 p-4 sm:p-5"}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className={[
                "font-black uppercase tracking-[0.25em] opacity-55",
                compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
              ].join(" ")}
            >
              Interés
            </p>
            <h3
              className={[
                "mt-2 font-extrabold leading-[1.08] tracking-tight",
                compact
                  ? "text-[1rem] sm:text-[1.08rem] md:text-[1.2rem]"
                  : "text-base sm:text-lg md:text-xl lg:text-xl",
              ].join(" ")}
            >
              {interest.meaning}
            </h3>
          </div>

          <div
            className={[
              "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl backdrop-blur-sm",
              style.badge,
            ].join(" ")}
          >
            {isSelected ? (
              <motion.span
                initial={{ scale: 0, rotate: -28, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 24 }}
              >
                <Check className="h-4 w-4 text-accent dark:text-white" />
              </motion.span>
            ) : (
              <span className="text-xs font-bold opacity-70">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div
        className={
          compact
            ? "relative z-10 p-4 pt-0 sm:p-4.5 sm:pt-0 md:p-5 md:pt-0"
            : "relative z-10 p-4 pt-0 sm:p-5 sm:pt-0"
        }
      >
        <p
          className={[
            "font-mono tracking-[0.18em] opacity-45 mb-2",
            compact ? "text-[9px] sm:text-[10px]" : "text-[10px]",
          ].join(" ")}
        >
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </p>

        <p
          className={[
            "leading-relaxed opacity-75",
            compact ? "text-xs sm:text-sm md:text-[15px]" : "text-xs sm:text-sm md:text-[15px]",
          ].join(" ")}
        >
          {interest.kanji}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs sm:text-sm font-semibold opacity-80">
            {isResolving
              ? "Cargando"
              : unavailable
              ? "No disponible"
              : isSelected
                ? "Seleccionado"
                : "Tocar para elegir"}
          </span>

          <span
            className={[
              "inline-flex items-center rounded-full px-3 py-1 text-[10px] sm:text-[11px] font-semibold",
              isSelected
                ? "bg-accent text-white"
                : "bg-black/5 text-content-secondary dark:bg-white/10 dark:text-white/80",
            ].join(" ")}
          >
            {isResolving ? "..." : unavailable ? "Sin tema" : isSelected ? "Activo" : "Elegir"}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
