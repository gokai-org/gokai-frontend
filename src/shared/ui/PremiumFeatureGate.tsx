import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, Crown, Sparkles } from "lucide-react";
import { LockedStateBadge } from "./LockedStateIndicator";

interface PremiumFeatureGateProps {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  featureLabel?: string;
  detailItems?: string[];
  caption?: string;
  hero?: ReactNode;
  className?: string;
}

export function PremiumFeatureGate({
  title,
  description,
  primaryHref,
  primaryLabel = "Hazte Pro",
  secondaryHref,
  secondaryLabel = "Ver planes",
  featureLabel = "Funcion premium",
  detailItems = [
    "Conversaciones ilimitadas",
    "Recomendaciones guiadas",
    "Practica personalizada",
  ],
  caption =
    "Activa GOKAI+ para entrar a esta experiencia premium sin salir de tu progreso actual.",
  hero,
  className = "",
}: PremiumFeatureGateProps) {
  return (
    <div
      className={[
        "absolute inset-0 z-10 flex items-center justify-center p-4 sm:p-6 lg:p-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(186,81,73,0.18),transparent_34%),linear-gradient(180deg,rgba(255,245,243,0.16),rgba(153,51,49,0.36))] backdrop-blur-[5px] dark:bg-[radial-gradient(circle_at_top,rgba(186,81,73,0.22),transparent_30%),linear-gradient(180deg,rgba(37,10,16,0.48),rgba(20,6,11,0.82))]" />

      <div className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-[#BA5149]/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,247,245,0.82))] p-6 shadow-[0_32px_110px_rgba(101,22,22,0.22)] backdrop-blur-xl dark:border-[#BA5149]/20 dark:bg-[linear-gradient(180deg,rgba(25,10,14,0.92),rgba(18,8,12,0.88))] sm:p-8 lg:p-10">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#BA5149]/18 blur-3xl dark:bg-[#BA5149]/16" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-[#993331]/14 blur-3xl dark:bg-[#993331]/18" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#BA5149]/60 to-transparent" />

        <div className="relative flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#BA5149]/18 bg-[#BA5149]/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#993331] dark:border-[#F0B2AD]/15 dark:bg-[#BA5149]/10 dark:text-[#F8C8C3]">
            <Crown className="h-3.5 w-3.5" strokeWidth={2} />
            Solo GOKAI+
          </div>

          <div className="mt-5 flex items-center justify-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[30px] border border-[#BA5149]/35 bg-gradient-to-br from-[#BA5149] via-[#A83F3A] to-[#7D2825] text-white shadow-[0_24px_48px_rgba(153,51,49,0.34)] dark:border-[#F0B2AD]/15">
              {hero ? (
                hero
              ) : (
                <span className="text-[11px] font-black tracking-[0.34em] text-white">
                  KAZU
                </span>
              )}
              <LockedStateBadge
                size="md"
                className="absolute -bottom-2 -right-2 border-[#FFD1CC]/60 bg-white text-[#993331] shadow-lg dark:border-[#F0B2AD]/15 dark:bg-[#1c0d10] dark:text-[#F8C8C3]"
              />
            </div>
          </div>

          <h2 className="mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-[#2B1216] dark:text-[#FFF4F2] sm:text-[2rem] lg:text-[2.15rem]">
            {title}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6E3B3A] dark:text-[#E7C5C2] sm:text-base">
            {description}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#BA5149]/18 bg-[#BA5149]/10 px-3 py-1.5 text-xs font-medium text-[#993331] dark:border-[#F0B2AD]/15 dark:bg-[#BA5149]/12 dark:text-[#FFD8D3]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              {featureLabel}
            </span>
            {detailItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center rounded-full border border-[#BA5149]/14 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#7F3C3A] dark:border-[#F0B2AD]/12 dark:bg-white/6 dark:text-[#F6DEDA]"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="mt-7 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href={primaryHref}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#993331] via-[#BA5149] to-[#D46A61] px-5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(153,51,49,0.24)] transition hover:brightness-105"
            >
              {primaryLabel}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </Link>

            {secondaryHref ? (
              <Link
                href={secondaryHref}
                className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border border-[#BA5149]/20 bg-white/82 px-5 text-sm font-semibold text-[#993331] transition hover:border-[#BA5149]/35 hover:bg-[#FFF5F3] dark:border-[#F0B2AD]/15 dark:bg-white/6 dark:text-[#FFE5E1] dark:hover:bg-white/10"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>

          <p className="mt-4 max-w-lg text-xs leading-6 text-[#8A5B59] dark:text-[#CFA7A2] sm:text-sm">
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}