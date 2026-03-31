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
}

export function FeatureCard({
  icon,
  title,
  desc,
  jp,
}: FeatureCardProps) {
  const isIconString = typeof icon === "string";

  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: -6 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-accent/10 bg-surface-primary p-5 shadow-[0_8px_24px_-10px_rgba(0,0,0,0.12)] transition-all duration-300 hover:border-accent/20 hover:shadow-[0_24px_52px_-20px_rgba(153,51,49,0.24)] sm:rounded-[30px] sm:p-7 md:p-8"
    >
      <div className="absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full bg-accent/[0.05]" />
      <div className="absolute bottom-[-22px] left-[68%] h-20 w-20 rounded-full bg-accent/[0.035]" />
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-accent via-[#b2413d] to-[#c85b55] sm:w-1.5" />

      {/* Kanji vertical decorativo */}
      <div className="pointer-events-none absolute right-3 top-3 z-0 flex flex-col items-center leading-none text-accent/10 select-none sm:right-6 sm:top-6 sm:text-accent/16 md:right-7 md:top-7">
        {jp.split("").map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            className="text-[2rem] font-semibold sm:text-[2.8rem] md:text-[3.4rem]"
          >
            {char}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col items-center justify-end text-center pb-2">
        {/* Icono */}
        <div className="mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-accent to-accent-hover shadow-[0_8px_18px_-6px_rgba(153,51,49,0.4)] sm:mb-6 sm:h-16 sm:w-16 sm:rounded-[22px] md:mb-7 md:h-20 md:w-20 md:rounded-[24px] md:shadow-[0_12px_25px_-10px_rgba(153,51,49,0.45)]">
          {isIconString ? (
            <div className="relative h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10">
              <Image
                src={icon}
                alt={title}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="text-content-inverted [&_svg]:h-6 [&_svg]:w-6 sm:[&_svg]:h-8 sm:[&_svg]:w-8 md:[&_svg]:h-10 md:[&_svg]:w-10">
              {icon}
            </div>
          )}
        </div>

        {/* Texto */}
        <div className="min-w-0 flex-1 overflow-hidden">
          <h3 className="text-[1.25rem] font-extrabold leading-[1.08] tracking-tight text-content-primary sm:text-[1.75rem] sm:leading-[1.02] md:text-[2rem]">
            {title}
          </h3>
          <p className="mt-2 text-[13px] leading-[1.5] text-content-secondary sm:mt-4 sm:text-[14.5px] sm:leading-[1.65] md:text-[15px]">
            {desc}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
