"use client";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { FaqAccordion } from "@/features/help/components/FaqAccordion";
import type { FaqItem } from "@/features/help/types";

interface HelpFaqSectionProps {
  searchQuery: string;
  faqs: FaqItem[];
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
}

export function HelpFaqSection({
  searchQuery,
  faqs,
  animationsEnabled = true,
}: HelpFaqSectionProps) {
  if (faqs.length === 0) {
    return (
      <motion.div
        initial={animationsEnabled ? { opacity: 0, scale: 0.95 } : false}
        animate={{ opacity: 1, scale: 1 }}
        className="py-16 text-center"
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
          <Search className="h-7 w-7 text-content-muted" />
        </div>
        <h3 className="mb-1 font-bold text-content-primary">
          No se encontraron resultados
        </h3>
        <p className="text-sm text-content-tertiary">
          No hubo coincidencias para “{searchQuery}”.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <FaqAccordion
          key={`${faq.question}-${index}`}
          item={faq}
          index={index}
          animationsEnabled={animationsEnabled}
        />
      ))}
    </div>
  );
}
