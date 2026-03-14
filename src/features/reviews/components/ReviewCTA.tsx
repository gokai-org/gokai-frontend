"use client";

import { motion } from "framer-motion";

export function ReviewCTA() {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="inline-block bg-[#993331]/10 px-8 py-4 rounded-full mb-4">
        <p className="text-xl font-bold text-[#993331]">
          毎日の復習が力になります
        </p>
      </div>
      <p className="text-gray-500 text-sm mb-6">
        El repaso diario se convierte en fortaleza. ¡Sigue practicando!
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="bg-gradient-to-r from-[#993331] to-[#7a2927] text-white px-8 py-3 rounded-full font-bold hover:shadow-lg transition-all shadow-md"
      >
        Comenzar sesión de repaso
      </motion.button>
    </div>
  );
}
