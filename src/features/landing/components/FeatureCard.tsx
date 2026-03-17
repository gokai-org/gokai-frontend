"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { ReactNode } from "react";

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
  index = 0,
}: FeatureCardProps) {
  const isIconString = typeof icon === "string";

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      className="group relative flex min-h-[300px] flex-col overflow-hidden rounded-[30px] border border-[#993331]/10 bg-white p-7 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#993331]/20 hover:shadow-[0_24px_52px_-20px_rgba(153,51,49,0.24)] md:min-h-[330px] md:p-8"
    >
      <div className="absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full bg-[#993331]/[0.05]" />
      <div className="absolute bottom-[-22px] left-[68%] h-20 w-20 rounded-full bg-[#993331]/[0.035]" />
      <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-[#993331] via-[#b2413d] to-[#c85b55]" />

      {/* Kanji vertical decorativo */}
      <div className="pointer-events-none absolute right-6 top-6 z-0 flex flex-col items-center leading-none text-[#993331]/16 select-none md:right-7 md:top-7">
        {jp.split("").map((char, charIndex) => (
          <span
            key={`${char}-${charIndex}`}
            className="text-[2.8rem] font-semibold md:text-[3.4rem]"
          >
            {char}
          </span>
        ))}
      </div>

      <div className="relative z-10 flex h-full flex-col">
        <div className="mb-7 flex h-20 w-20 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#993331] to-[#7a2927] shadow-[0_12px_25px_-10px_rgba(153,51,49,0.45)]">
          {isIconString ? (
            <div className="relative h-10 w-10">
              <Image
                src={icon}
                alt={title}
                fill
                className="object-contain opacity-100"
              />
            </div>
          ) : (
            <div className="text-white [&_svg]:h-10 [&_svg]:w-10">
              {icon}
            </div>
          )}
        </div>

        <div className="max-w-[76%] text-left md:max-w-[74%]">
          <h3 className="text-[2rem] font-extrabold leading-[1.02] tracking-tight text-neutral-950 md:text-[2.2rem]">
            {title}
          </h3>

          <p className="mt-5 text-[15px] leading-[1.7] text-neutral-600 md:text-base">
            {desc}
          </p>
        </div>
      </div>
    </motion.article>
  );
}