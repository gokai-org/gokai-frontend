"use client";

import { Mail, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface HelpSupportCTAProps {
  onContactSupport: () => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function HelpSupportCTA({
  onContactSupport,
  animationsEnabled = true,
}: HelpSupportCTAProps) {
  const button = (
    <motion.button
      whileHover={animationsEnabled ? { scale: 1.03 } : {}}
      whileTap={animationsEnabled ? { scale: 0.97 } : {}}
      onClick={onContactSupport}
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 transition-shadow duration-300 hover:shadow-xl hover:shadow-[#993331]/25"
    >
      <Mail className="h-4 w-4" />
      Contactar soporte
    </motion.button>
  );

  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-[#993331]/10">
          <MessageCircle className="h-8 w-8 text-[#993331]" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="mb-1 text-lg font-extrabold text-gray-900">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm leading-relaxed text-gray-500">
            Nuestro equipo de soporte está aquí para ayudarte con dudas,
            errores o comentarios sobre tu experiencia en Gokai.
          </p>
        </div>

        <div className="flex-shrink-0">{button}</div>
      </div>
    </section>
  );
}