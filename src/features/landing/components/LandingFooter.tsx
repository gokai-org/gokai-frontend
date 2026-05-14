"use client";

import { motion } from "framer-motion";
import { fadeUpSoft } from "@/features/landing/lib/motionVariants";

interface LandingFooterProps {
  onOpenTerms: () => void;
}

export function LandingFooter({ onOpenTerms }: LandingFooterProps) {
  return (
    <motion.footer
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeUpSoft}
      className="relative z-10 mt-10 border-t border-border-default/70 bg-surface-primary/85 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-10 text-center text-sm text-content-secondary md:flex-row md:items-center md:justify-between md:text-left">
        <div className="flex flex-col items-center gap-1.5 md:items-start">
          <p>© {new Date().getFullYear()} GOKAI — Aprende japonés con IA.</p>
          <button
            type="button"
            onClick={onOpenTerms}
            className="text-xs font-semibold text-accent transition-colors hover:text-accent-hover"
          >
            Términos y Condiciones
          </button>
        </div>
        <p className="text-content-tertiary md:max-w-md md:text-right">
          Explora, aprende y practica con una experiencia más inteligente.
        </p>
      </div>
    </motion.footer>
  );
}
