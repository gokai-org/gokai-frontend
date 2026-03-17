"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface LandingHeroSectionProps {
  titleA?: string;
  titleB?: string;
  desc?: string;
  cta?: {
    label: string;
    href: string;
  };
}

export function LandingHeroSection({
  titleA,
  titleB,
  desc,
  cta,
}: LandingHeroSectionProps) {
  return (
    <div className="max-w-2xl">
      <motion.h2
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl"
      >
        <span className="block">{titleA}</span>
        <span className="block text-[#993331]">{titleB}</span>
      </motion.h2>

      {desc && (
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-lg leading-relaxed text-neutral-700 md:text-2xl"
        >
          {desc}
        </motion.p>
      )}

      {cta && (
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={cta.href}
              className="inline-flex rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-[#993331]/20 transition-all duration-300 hover:shadow-xl"
            >
              {cta.label}
            </Link>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-14 flex items-center gap-2 text-xs text-neutral-400"
      >
        <span>Desliza para ver más</span>
        <span className="translate-y-[1px]">↓</span>
      </motion.div>
    </div>
  );
}