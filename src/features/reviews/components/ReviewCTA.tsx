"use client";

import { motion } from "framer-motion";

export function ReviewCTA() {
  return (
    <div className="bg-surface-primary rounded-3xl p-8 shadow-sm border border-border-subtle text-center">
      <div className="inline-block border border-accent/20 bg-accent/10 px-8 py-4 rounded-full mb-4">
        <p className="text-xl font-bold text-accent">
          毎日の復習が力になります
        </p>
      </div>
      <p className="text-content-tertiary text-sm mb-6">
        El repaso diario se convierte en fortaleza. ¡Sigue practicando!
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="bg-gradient-to-r from-accent to-accent-hover text-content-inverted px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md"
      >
        Comenzar sesión de repaso
      </motion.button>
    </div>
  );
}
