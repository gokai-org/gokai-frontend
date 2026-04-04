"use client";

import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { HELP_GUIDES } from "@/features/help/utils/help.constants";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface HelpGuidesSectionProps {
  onStartGuide: (tourIndex: number) => void;
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function HelpGuidesSection({
  onStartGuide,
  animationsEnabled = true,
}: HelpGuidesSectionProps) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {HELP_GUIDES.map((guide, index) => {
        const card = (
          <button
            key={guide.title}
            onClick={() => onStartGuide(guide.tourIndex)}
            className="group h-full w-full rounded-2xl border border-border-subtle bg-surface-primary p-6 text-left shadow-sm transition-all duration-300 hover:border-accent/20 hover:shadow-[0_12px_24px_-4px_rgba(153,51,49,0.12)]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl ${guide.bgColor} ${guide.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {guide.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-1.5 text-base font-bold text-content-primary transition-colors duration-300 group-hover:text-accent">
                  {guide.title}
                </h3>
                <p className="text-sm leading-relaxed text-content-tertiary">
                  {guide.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>Ver guía</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </button>
        );

        if (!animationsEnabled)
          return (
            <div key={guide.title} className="h-full">
              {card}
            </div>
          );

        return (
          <motion.div
            key={guide.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease, delay: index * 0.08 }}
            className="h-full"
          >
            {card}
          </motion.div>
        );
      })}
    </div>
  );
}
