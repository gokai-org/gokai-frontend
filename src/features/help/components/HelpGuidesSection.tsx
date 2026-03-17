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
            className="group rounded-2xl border border-gray-100 bg-white p-6 text-left shadow-sm transition-all duration-300 hover:border-[#993331]/20 hover:shadow-[0_12px_24px_-4px_rgba(153,51,49,0.12)]"
          >
            <div className="flex items-start gap-4">
              <div
                className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${guide.bgColor} ${guide.color} transition-transform duration-300 group-hover:scale-110`}
              >
                {guide.icon}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="mb-1.5 text-sm font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#993331]">
                  {guide.title}
                </h3>
                <p className="text-xs leading-relaxed text-gray-500">
                  {guide.description}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#993331] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span>Ver guía</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </button>
        );

        if (!animationsEnabled) return card;

        return (
          <motion.div
            key={guide.title}
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