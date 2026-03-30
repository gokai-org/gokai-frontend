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
            <div className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-primary p-6 shadow-sm">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {tip.icon}
              </div>
              <div>
                <h3 className="mb-1 text-sm font-bold text-content-primary">
                  {tip.title}
                </h3>
                <p className="text-xs leading-relaxed text-content-tertiary">
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
        className="relative overflow-hidden rounded-3xl border border-amber-200 dark:border-amber-800/30 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 p-8"
      >
        <div className="absolute right-[-10px] top-[-20px] h-28 w-28 rounded-full bg-amber-200/20 dark:bg-amber-700/10" />
        <div className="absolute bottom-[-15px] left-[40%] h-20 w-20 rounded-full bg-orange-200/20 dark:bg-orange-700/10" />

        <div className="relative z-10 flex items-start gap-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 dark:bg-amber-500/10">
            <Rocket className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>

          <div>
            <h3 className="mb-2 text-lg font-extrabold text-amber-700 dark:text-amber-300">
              Consejo del día
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-content-secondary">
              La mejor forma de aprender kanji es en contexto. En lugar de memorizar
              caracteres aislados, intenta leer frases completas y asociar cada kanji
              con situaciones reales. El cerebro recuerda mejor historias que datos
              sueltos.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
              <Lightbulb className="h-4 w-4" />
              <span>Aprendizaje contextual y progresivo</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}