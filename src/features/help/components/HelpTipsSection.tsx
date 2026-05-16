"use client";

import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
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
  );
}
