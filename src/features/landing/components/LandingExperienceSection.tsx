"use client";

import { useState } from "react";
import Image from "next/image";
import { FEATURES } from "@/features/landing/data/landingData";

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}
function ss(e0: number, e1: number, v: number) {
  const x = clamp((v - e0) / (e1 - e0 || 1), 0, 1);
  return x * x * (3 - 2 * x);
}

const N = FEATURES.length;

const CARD_STYLES: { bg: string; text: string; icon: string; kanji: string }[] =
  [
    {
      bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
      text: "text-content-primary dark:text-white",
      icon: "bg-content-primary/10 dark:bg-white/10",
      kanji: "text-content-primary dark:text-white",
    },
    {
      bg: "bg-accent/15 dark:bg-accent/20",
      text: "text-content-primary dark:text-white",
      icon: "bg-accent/15 dark:bg-accent/25",
      kanji: "text-accent dark:text-accent",
    },
    {
      bg: "bg-accent dark:bg-accent",
      text: "text-white",
      icon: "bg-white/15",
      kanji: "text-white",
    },
    {
      bg: "bg-surface-secondary dark:bg-surface-secondary",
      text: "text-content-primary",
      icon: "bg-content-primary/10 dark:bg-white/10",
      kanji: "text-content-primary dark:text-white",
    },
    {
      bg: "bg-surface-tertiary dark:bg-[#1a1a1a]",
      text: "text-content-primary dark:text-white",
      icon: "bg-content-primary/10 dark:bg-white/10",
      kanji: "text-content-primary dark:text-white",
    },
    {
      bg: "bg-accent/15 dark:bg-accent/20",
      text: "text-content-primary dark:text-white",
      icon: "bg-accent/15 dark:bg-accent/25",
      kanji: "text-accent dark:text-accent",
    },
  ];

function cardEnterT(i: number, sp: number) {
  const start = 0.48 + i * 0.035;
  const end = start + 0.1;
  return ss(start, end, sp);
}

interface LandingExperienceSectionProps {
  sectionProgress: number;
}

export function LandingExperienceSection({
  sectionProgress: sp,
}: LandingExperienceSectionProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // FASE 0 — intro
  const introIn = ss(0.04, 0.2, sp);
  const introStay = 1 - ss(0.38, 0.48, sp);
  const introAlpha = introIn * introStay;
  const introY = (1 - introIn) * 28 + (1 - introStay) * -18;

  // FASE 1 — card deck
  const deckGlobalIn = ss(0.44, 0.54, sp);
  const deckGlobalOut = 1 - ss(0.88, 0.96, sp);
  const deckAlpha = deckGlobalIn * deckGlobalOut;

  return (
    <section
      id="experiencia"
      data-section
      className="relative h-[300svh] scroll-mt-28"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-start overflow-hidden pt-12 sm:pt-16 lg:justify-center lg:pt-0">
        {/* ── FASE 0 — intro ───────────────────────────────────────── */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
          style={{
            opacity: introAlpha,
            transform: `translateY(${introY}px)`,
            willChange: "transform, opacity",
          }}
        >
          <div className="mx-auto w-full max-w-3xl text-center">
            <p className="font-sans text-[10px] font-black uppercase tracking-[0.30em] text-accent/75">
              G O K A I
            </p>
            <h2 className="font-sans mt-4 text-4xl font-black leading-[1.02] tracking-tight text-content-primary sm:text-6xl lg:text-7xl">
              Una experiencia
              <br />
              que evoluciona contigo.
              <br />
            </h2>
            <div className="mx-auto mt-7 max-w-xl border-t border-content-primary/10 pt-6">
              <p className="font-sans text-base leading-relaxed text-content-primary/65 sm:text-lg">
                Aprende japonés con inteligencia adaptativa, rutas
                personalizadas y práctica inmersiva.
              </p>
            </div>
          </div>
        </div>

        {/* ── FASE 1 — panel cards (edge-to-edge) ──────────────────── */}
        <div
          className="absolute inset-0 z-10 flex items-stretch overflow-hidden lg:items-center"
          style={{ opacity: deckAlpha, willChange: "opacity" }}
        >
          {/* Mobile/Tablet: usa la altura del viewport para evitar huecos grandes bajo la grilla */}
          <div className="grid h-full min-h-full w-full grid-cols-1 content-stretch auto-rows-[minmax(180px,auto)] gap-3 px-3 pt-16 pb-10 min-[360px]:grid-cols-2 min-[360px]:grid-rows-3 min-[360px]:auto-rows-fr sm:gap-4 sm:px-5 sm:pt-20 sm:pb-12 md:gap-5 md:px-8 md:pt-24 md:pb-14 lg:hidden">
            {FEATURES.map((f, i) => {
              const t = cardEnterT(i, sp);
              return (
                <div
                  key={f.title}
                  className="h-full w-full min-h-0"
                  style={{
                    opacity: t,
                    transform: `translateY(${(1 - t) * 50}px)`,
                    willChange: "transform, opacity",
                  }}
                >
                  <PanelCard
                    feature={f}
                    index={i}
                    total={N}
                    isExpanded={false}
                  />
                </div>
              );
            })}
          </div>

          {/* Desktop: flex row edge-to-edge con rounded en extremos */}
          <div
            className="hidden w-full overflow-hidden rounded-[20px] lg:flex lg:h-[78vh] lg:max-h-[720px] lg:min-h-[480px] lg:mx-6 xl:mx-10 2xl:mx-14"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {FEATURES.map((f, i) => {
              const t = cardEnterT(i, sp);
              const isExpanded = hoveredIndex === i;
              const hasHover = hoveredIndex !== null;

              return (
                <div
                  key={f.title}
                  className="relative min-w-0 basis-0 transition-[flex] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    flex: isExpanded ? 2.6 : hasHover ? 0.65 : 1,
                    opacity: t,
                    transform: `translateY(${(1 - t) * 60}px)`,
                    willChange: "transform, opacity, flex",
                  }}
                  onMouseEnter={() => setHoveredIndex(i)}
                >
                  <PanelCard
                    feature={f}
                    index={i}
                    total={N}
                    isExpanded={isExpanded}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── PanelCard ─────────────────────────────────────────────────────────────
function PanelCard({
  feature,
  index,
  total,
  isExpanded,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
  total: number;
  isExpanded: boolean;
}) {
  const isIconString = typeof feature.icon === "string";
  const style = CARD_STYLES[index % CARD_STYLES.length];

  return (
    <article
      className={[
        "group relative flex h-full flex-col justify-between overflow-hidden font-sans",
        "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        style.bg,
        style.text,
        // Mobile/Tablet: card compacta con rounded
        "w-full min-h-[110px] sm:min-h-[140px] md:min-h-[160px] rounded-2xl",
        // Desktop: llena el flex, sin width fijo
        "lg:min-w-0 lg:w-auto lg:min-h-0 lg:rounded-none lg:shrink",
      ].join(" ")}
    >
      {/* Kanji decorativo de fondo */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-start select-none overflow-hidden pl-2 pb-8 sm:pl-4 sm:pb-12 lg:pl-6 lg:pb-20">
        <span
          className={[
            "font-black leading-none transition-all duration-500",
            style.kanji,
            isExpanded
              ? "text-[10rem] lg:text-[14rem] opacity-[0.10] scale-105"
              : "text-[3.5rem] sm:text-[5rem] md:text-[7rem] lg:text-[11rem] opacity-[0.07] scale-100",
          ].join(" ")}
        >
          {feature.jp}
        </span>
      </div>

      {/* Top: título + ícono */}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <h3
            className={[
              "font-sans font-extrabold uppercase leading-[1.05] tracking-tight transition-all duration-500",
              "text-xs sm:text-sm md:text-base",
              isExpanded ? "lg:text-2xl xl:text-3xl" : "lg:text-lg",
            ].join(" ")}
          >
            {feature.title}
          </h3>
          <div
            className={[
              "flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-lg backdrop-blur-sm lg:h-9 lg:w-9",
              style.icon,
            ].join(" ")}
          >
            {isIconString ? (
              <div className="relative h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5">
                <Image
                  src={feature.icon as string}
                  alt=""
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="[&_svg]:h-3 [&_svg]:w-3 sm:[&_svg]:h-4 sm:[&_svg]:w-4 lg:[&_svg]:h-5 lg:[&_svg]:w-5">
                {feature.icon}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: counter + desc */}
      <div className="relative z-10 p-3 sm:p-4 lg:p-6">
        <p className="font-mono text-[9px] sm:text-[10px] lg:text-[11px] tracking-wider opacity-40 mb-1 sm:mb-2">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </p>
        <p
          className={[
            "font-sans text-[10px] leading-relaxed transition-all duration-500 sm:text-xs md:text-sm opacity-70 line-clamp-2 sm:line-clamp-3 lg:line-clamp-none",
            isExpanded
              ? "lg:opacity-70 lg:max-h-40 lg:translate-y-0"
              : "lg:opacity-0 lg:max-h-0 lg:translate-y-3 lg:overflow-hidden",
          ].join(" ")}
        >
          {feature.desc}
        </p>
      </div>
    </article>
  );
}
