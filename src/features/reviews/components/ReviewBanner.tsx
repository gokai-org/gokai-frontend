"use client";

import { motion } from "framer-motion";

interface ReviewBannerProps {
  pendingCount: number;
}

export function ReviewBanner({ pendingCount }: ReviewBannerProps) {
  return (
    <div className="mb-8 bg-gradient-to-r from-[#993331] to-[#7a2927] rounded-3xl p-8 md:p-10 text-white shadow-lg relative overflow-hidden">
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-white/80 text-sm font-medium mb-1"
          >
            Sesión de repaso
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
          >
            ¡Hora de repasar!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="text-white/80 mt-2 text-sm max-w-md"
          >
            復習の時間です。少しずつ進めましょう！
            <br />
            <span className="text-white/60 text-xs">
              Es momento de repasar. ¡Vamos paso a paso!
            </span>
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex items-center gap-4"
        >
          <div className="text-center">
            <p className="text-4xl font-extrabold">{pendingCount}</p>
            <p className="text-xs text-white/70 font-medium mt-1">
              Pendientes
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
