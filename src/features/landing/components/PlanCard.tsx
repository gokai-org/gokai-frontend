"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface PlanCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  href: string;
  ctaLabel?: string;
  highlighted?: boolean;
  badge?: string;
  animated?: boolean;
}

export function PlanCard({
  title,
  price,
  description,
  features,
  href,
  ctaLabel = "Elegir plan",
  highlighted = false,
  badge,
  animated = true,
}: PlanCardProps) {
  const jp = highlighted ? "特典" : "無料";

  const animationProps = animated
    ? {
        initial: { opacity: 0, y: 24, scale: 0.985 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, margin: "-80px" },
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
        whileHover: { y: -8, scale: 1.01 },
      }
    : {};

  return (
    <motion.article
      {...animationProps}
      className={[
        "relative flex h-full min-h-[480px] flex-col overflow-hidden rounded-[40px] border p-6 transition-all duration-300 lg:min-h-[520px] lg:p-8",
        highlighted
          ? "border-accent/60 bg-accent shadow-[0_8px_40px_-8px_rgba(153,51,49,0.55),0_20px_60px_-16px_rgba(153,51,49,0.35)] ring-2 ring-accent/40"
          : "border-border-subtle bg-surface-primary shadow-[var(--shadow-lg)]",
      ].join(" ")}
    >
      {/* decorativos */}
      <div className={[
        "absolute right-[-16px] top-[-16px] h-28 w-28 rounded-full",
        highlighted ? "bg-white/[0.15]" : "bg-accent/[0.05]",
      ].join(" ")} />
      <div className={[
        "absolute bottom-[-20px] left-[72%] h-20 w-20 rounded-full",
        highlighted ? "bg-white/[0.10]" : "bg-accent/[0.04]",
      ].join(" ")} />
      {highlighted && (
        <div className="absolute left-[-30px] top-[40%] h-24 w-24 rounded-full bg-white/[0.08]" />
      )}

      {/* kanji vertical decorativo */}
      <div className={`pointer-events-none absolute right-7 top-8 z-0 flex flex-col items-center leading-none select-none ${highlighted ? "text-white/15" : "text-accent/12"}`}>
        {jp.split("").map((char, index) => (
          <span
            key={`${char}-${index}`}
            className="text-[3.1rem] font-semibold lg:text-[3.8rem]"
          >
            {char}
          </span>
        ))}
      </div>

      {/* espacio fijo para badge */}
      <div className="relative z-10 mb-4 min-h-[36px]">
        {badge ? (
          <div className="w-fit rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-bold text-white shadow-lg shadow-black/10 ring-1 ring-white/30">
            {badge}
          </div>
        ) : (
          <div className="h-[36px]" />
        )}
      </div>

      {/* header */}
      <div className="relative z-10 flex min-h-[120px] flex-col text-left">
        <div className="max-w-[82%]">
          <h3 className={`text-[1.75rem] font-extrabold leading-[1.02] tracking-tight lg:text-[2rem] ${highlighted ? "text-white" : "text-content-primary"}`}>
            {title}
          </h3>

          <p className={`mt-2 text-base leading-relaxed ${highlighted ? "text-white/80" : "text-content-secondary"}`}>
            {description}
          </p>
        </div>
      </div>

      {/* precio */}
      <div className="relative z-10 my-5 flex min-h-[80px] items-center">
        <div className="text-left">
          <p
            className={[
              "font-black tracking-tight",
              highlighted
                ? "text-5xl text-white lg:text-6xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                : "text-5xl text-accent lg:text-6xl",
            ].join(" ")}
          >
            {price}
          </p>

          <p className={`mt-2 text-sm font-semibold uppercase tracking-[0.18em] ${highlighted ? "text-white/60" : "text-content-muted"}`}>
            {highlighted ? "Plan premium" : "Plan inicial"}
          </p>
        </div>
      </div>

      {/* lista */}
      <div className="relative z-10 flex-1 space-y-3">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-3">
            <div
              className={[
                "mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm",
                highlighted
                  ? "bg-white/20 text-white"
                  : "bg-surface-tertiary text-accent",
              ].join(" ")}
            >
              <Check className="h-5 w-5" />
            </div>

            <p className={`text-base leading-relaxed ${highlighted ? "text-white/85" : "text-content-secondary"}`}>
              {feature}
            </p>
          </div>
        ))}
      </div>

      {/* botón */}
      <div className="relative z-10 mt-6">
        <Link
          href={href}
          className={[
            "inline-flex w-full items-center justify-center rounded-full px-6 py-3.5 text-lg font-extrabold transition-all duration-300",
            highlighted
              ? "bg-white text-accent hover:bg-white/90 shadow-lg shadow-black/10 hover:shadow-xl ring-1 ring-white/30"
              : "border border-border-default/70 bg-surface-tertiary text-content-primary hover:bg-surface-secondary",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      </div>
    </motion.article>
  );
}