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
      className="flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-accent-hover px-8 py-3.5 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-shadow duration-300 hover:shadow-xl hover:shadow-accent/25"
    >
      <Mail className="h-4 w-4" />
      Contactar soporte
    </motion.button>
  );

  return (
    <section className="rounded-3xl border border-border-subtle bg-surface-primary p-8 shadow-sm">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-accent/10">
          <MessageCircle className="h-8 w-8 text-accent" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3 className="mb-1 text-lg font-extrabold text-content-primary">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-sm leading-relaxed text-content-tertiary">
            Nuestro equipo de soporte está aquí para ayudarte con dudas, errores
            o comentarios sobre tu experiencia en Gokai.
          </p>
        </div>

        <div className="flex-shrink-0">{button}</div>
      </div>
    </section>
  );
}
