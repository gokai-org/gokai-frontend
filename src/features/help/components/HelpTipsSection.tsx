"use client";

import { motion } from "framer-motion";
import { Lightbulb, Rocket } from "lucide-react";
import { HELP_TIPS } from "@/features/help/utils/help.constants";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface HelpTipsSectionProps {
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function HelpTipsSection({
  animationsEnabled = true,
}: HelpTipsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {HELP_TIPS.map((tip, index) => {
          const card = (
            <div className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#993331]/10 text-[#993331]">
                {tip.icon}
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold text-gray-900">
                  {tip.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {tip.description}
                </p>
              </div>
            </div>
          );

          if (!animationsEnabled) {
            return <div key={tip.title}>{card}</div>;
          }

          return (
            <motion.div
              key={tip.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease, delay: index * 0.08 }}
            >
              {card}
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={animationsEnabled ? { opacity: 0, y: 20 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease, delay: 0.2 }}
        className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 to-orange-50 p-8"
      >
        <div className="absolute right-[-10px] top-[-20px] h-28 w-28 rounded-full bg-amber-200/20" />
        <div className="absolute bottom-[-15px] left-[40%] h-20 w-20 rounded-full bg-orange-200/20" />

        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15">
            <Rocket className="h-7 w-7 text-amber-600" />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-extrabold text-gray-900">
              Consejo del día
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-gray-700">
              La mejor forma de aprender kanji es en contexto. En lugar de memorizar
              caracteres aislados, intenta leer frases completas y asociar cada kanji
              con situaciones reales. El cerebro recuerda mejor historias que datos
              sueltos.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600">
              <Lightbulb className="h-4 w-4" />
              <span>Aprendizaje contextual y progresivo</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}