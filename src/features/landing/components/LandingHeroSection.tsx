"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  fadeUp,
  fadeUpSoft,
  scaleFade,
  staggerContainer,
} from "@/features/landing/lib/motionVariants";

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
    <motion.div
      className="max-w-2xl"
      variants={staggerContainer(0.1, 0.05)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
    >
      <motion.h2
        variants={fadeUp}
        className="text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl md:text-7xl"
      >
        <span className="block">{titleA}</span>
        <span className="block text-accent">{titleB}</span>
      </motion.h2>

      {desc && (
        <motion.p
          variants={fadeUpSoft}
          className="mt-4 text-sm leading-relaxed text-content-secondary sm:text-base md:text-2xl"
        >
          {desc}
        </motion.p>
      )}

      {cta && (
        <motion.div variants={scaleFade} className="mt-8">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href={cta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-5 py-2.5 text-sm font-semibold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-300 sm:gap-2.5 sm:px-8 sm:py-4 sm:text-base hover:shadow-[0_20px_44px_-14px_rgba(153,51,49,0.52)]"
            >
              {cta.label}
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { duration: 0.5 },
          },
        }}
        className="mt-4 flex items-center gap-2 text-xs text-content-muted"
      >
        <span>Desliza para entrar en la ruta</span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="inline-block"
        >
          ↓
        </motion.span>
      </motion.div>
    </motion.div>
  );
}
