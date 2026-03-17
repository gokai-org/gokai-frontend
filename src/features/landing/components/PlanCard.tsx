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
}: PlanCardProps) {
  const jp = highlighted ? "特典" : "無料";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8, scale: 1.01 }}
      className={[
        "relative flex h-full min-h-[650px] flex-col overflow-hidden rounded-[40px] border p-8 transition-all duration-300 lg:min-h-[690px] lg:p-10",
        highlighted
          ? "border-[#993331]/20 bg-gradient-to-b from-white via-[#fff9f8] to-[#fff1ef] shadow-[0_30px_70px_-26px_rgba(153,51,49,0.34)]"
          : "border-black/5 bg-white shadow-[0_22px_50px_-22px_rgba(0,0,0,0.18)]",
      ].join(" ")}
    >
      {/* decorativos */}
      <div className="absolute right-[-16px] top-[-16px] h-28 w-28 rounded-full bg-[#993331]/[0.05]" />
      <div className="absolute bottom-[-20px] left-[72%] h-20 w-20 rounded-full bg-[#993331]/[0.04]" />

      {/* kanji vertical decorativo */}
      <div className="pointer-events-none absolute right-7 top-8 z-0 flex flex-col items-center leading-none text-[#993331]/12 select-none">
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
      <div className="relative z-10 mb-6 min-h-[44px]">
        {badge ? (
          <div className="w-fit rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#993331]/20">
            {badge}
          </div>
        ) : (
          <div className="h-[44px]" />
        )}
      </div>

      {/* header */}
      <div className="relative z-10 flex min-h-[175px] flex-col text-left">
        <div className="max-w-[82%]">
          <h3 className="text-[2.15rem] font-extrabold leading-[1.02] tracking-tight text-neutral-950 lg:text-[2.45rem]">
            {title}
          </h3>

          <p className="mt-4 text-lg leading-relaxed text-neutral-600">
            {description}
          </p>
        </div>
      </div>

      {/* precio */}
      <div className="relative z-10 my-8 flex min-h-[120px] items-center">
        <div className="text-left">
          <p
            className={[
              "font-black tracking-tight",
              highlighted
                ? "text-6xl text-[#b33c37] lg:text-7xl"
                : "text-6xl text-[#b33c37] lg:text-7xl",
            ].join(" ")}
          >
            {price}
          </p>

          <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
            {highlighted ? "Plan premium" : "Plan inicial"}
          </p>
        </div>
      </div>

      {/* lista */}
      <div className="relative z-10 flex-1 space-y-5">
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-4">
            <div
              className={[
                "mt-0.5 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-sm",
                highlighted
                  ? "bg-[#993331]/10 text-[#993331]"
                  : "bg-neutral-100 text-[#993331]",
              ].join(" ")}
            >
              <Check className="h-5 w-5" />
            </div>

            <p className="text-lg leading-relaxed text-neutral-700">
              {feature}
            </p>
          </div>
        ))}
      </div>

      {/* botón */}
      <div className="relative z-10 mt-10">
        <Link
          href={href}
          className={[
            "inline-flex w-full items-center justify-center rounded-full px-6 py-5 text-xl font-extrabold transition-all duration-300",
            highlighted
              ? "bg-gradient-to-r from-[#993331] to-[#7a2927] text-white shadow-[0_18px_38px_-16px_rgba(153,51,49,0.52)] hover:shadow-[0_22px_48px_-18px_rgba(153,51,49,0.60)]"
              : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200",
          ].join(" ")}
        >
          {ctaLabel}
        </Link>
      </div>
    </motion.article>
  );
}