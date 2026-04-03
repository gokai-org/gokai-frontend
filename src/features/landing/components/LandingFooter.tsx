"use client";

import { motion } from "framer-motion";
import { fadeUpSoft } from "@/features/landing/lib/motionVariants";

export function LandingFooter() {
  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUpSoft}
      className="relative z-10 mt-10 border-t border-border-default/70 bg-surface-primary/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-content-secondary md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} GOKAI — Aprende japonés con IA.</p>
        <p className="text-content-tertiary">
          Explora, aprende y practica con una experiencia más inteligente.
        </p>
      </div>
    </motion.footer>
  );
}