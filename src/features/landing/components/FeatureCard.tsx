"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";
import { cardReveal } from "@/features/landing/lib/motionVariants";

interface FeatureCardProps {
  icon: ReactNode | string;
  title: string;
  desc: string;
  jp: string;
  index?: number;
  compact?: boolean;
}

export function FeatureCard({
  icon,
  title,
  desc,
  jp,
  compact = false,
}: FeatureCardProps) {
  const isIconString = typeof icon === "string";

  if (compact) {
    return (
      <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border-default/60 bg-surface-primary/90 shadow-[var(--shadow-md)] backdrop-blur-xl transition-all duration-300 hover:border-accent/18 hover:shadow-[var(--shadow-lg)] dark:bg-surface-secondary/80 dark:border-border-default/40 w-[260px]">
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

        {/* Icon header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-hover shadow-[0_6px_12px_-4px_rgba(153,51,49,0.38)]">
            {isIconString ? (
              <div className="relative h-5 w-5">
                <Image src={icon as string} alt={title} fill className="object-contain" />
              </div>
            ) : (
              <div className="text-content-inverted [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
            )}
          </div>
          <div className="pointer-events-none text-[1.6rem] font-bold text-accent/12 dark:text-accent/8 select-none leading-none">
            {jp}
          </div>
        </div>

        {/* Content body */}
        <div className="px-5 pb-5 flex-1">
          <h3 className="text-[0.92rem] font-extrabold leading-tight tracking-tight text-content-primary">
            {title}
          </h3>
          <p className="mt-2 text-[11.5px] leading-[1.55] text-content-secondary dark:text-content-tertiary line-clamp-3">
            {desc}
          </p>
        </div>
      </article>
    );
  }

  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: -8 }}
      className="group relative flex h-full min-h-[290px] flex-col overflow-hidden rounded-[30px] border border-border-default/70 bg-surface-primary/78 p-5 shadow-[var(--shadow-lg)] backdrop-blur-xl transition-all duration-300 hover:border-accent/18 hover:shadow-[var(--shadow-xl)] sm:p-7"
    >
      <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-accent/55 to-transparent" />
      <div className="absolute right-[-18px] top-[-18px] h-32 w-32 rounded-full bg-accent/[0.06]" />
      <div className="absolute bottom-[-18px] left-[62%] h-24 w-24 rounded-full bg-accent/[0.035]" />

      <div className="pointer-events-none absolute right-3 top-3 z-0 flex flex-col items-center leading-none text-accent/10 select-none sm:right-6 sm:top-6 sm:text-accent/16 md:right-7 md:top-7">
        {jp.split("").map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            className="text-[2rem] font-semibold sm:text-[2.6rem] md:text-[3.1rem]"
          >
            {char}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col pb-1">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-accent to-accent-hover shadow-[0_10px_18px_-8px_rgba(153,51,49,0.4)] sm:h-14 sm:w-14">
          {isIconString ? (
            <div className="relative h-6 w-6 sm:h-7 sm:w-7">
              <Image
                src={icon}
                alt={title}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-content-inverted [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-7 sm:[&_svg]:w-7">
              {icon}
            </div>
          )}
          </div>

          <div className="rounded-full border border-accent/10 bg-accent/[0.05] px-3 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-accent">
            Nodo
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="text-[1.35rem] font-extrabold leading-[1.06] tracking-tight text-content-primary sm:text-[1.7rem]">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-[1.7] text-content-secondary sm:text-[15px]">
            {desc}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
