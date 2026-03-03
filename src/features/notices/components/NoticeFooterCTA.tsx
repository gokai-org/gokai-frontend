"use client";

import { motion } from "framer-motion";
import { Bell, Settings } from "lucide-react";

export default function NoticeFooterCTA() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
      className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
    >
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="w-14 h-14 rounded-2xl bg-[#993331]/10 flex items-center justify-center flex-shrink-0">
          <Bell className="w-7 h-7 text-[#993331]" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="font-extrabold text-gray-900 text-lg mb-1">
            Configura tus preferencias de notificación
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            Elige qué tipo de notificaciones quieres recibir, la frecuencia de
            recordatorios de revisión y los canales de comunicación.
          </p>
        </div>
        <a
          href="/dashboard/configuration"
          className="bg-gradient-to-r from-[#993331] to-[#7a2927] text-white px-8 py-3.5 rounded-full font-bold text-sm shadow-lg shadow-[#993331]/20 hover:shadow-xl hover:shadow-[#993331]/25 transition-shadow duration-200 flex items-center gap-2 flex-shrink-0 active:scale-[0.97]"
        >
          <Settings className="w-4 h-4" />
          Configuración
        </a>
      </div>
    </motion.div>
  );
}
