"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";
import type { FaqItem } from "@/features/help/types";

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface FaqAccordionProps {
  item: FaqItem;
  index?: number;
  animationsEnabled?: boolean;
}

export function FaqAccordion({
  item,
  index = 0,
  animationsEnabled = true,
}: FaqAccordionProps) {
  const [open, setOpen] = useState(false);

  const content = (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group w-full text-left"
      >
        <div
          className={`flex items-start gap-4 rounded-2xl border p-5 transition-all duration-300 ${
            open
              ? "border-accent/15 bg-accent/5"
              : "border-transparent bg-surface-secondary/80 hover:border-border-default hover:bg-surface-tertiary/80"
          }`}
        >
          <div
            className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl transition-colors duration-300 ${
              open
                ? "bg-accent text-content-inverted"
                : "bg-surface-tertiary/80 text-content-tertiary group-hover:bg-accent/10 group-hover:text-accent"
            }`}
          >
            <HelpCircle className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <h3
                className={`text-sm font-bold transition-colors duration-300 ${
                  open ? "text-accent" : "text-content-primary"
                }`}
              >
                {item.question}
              </h3>

              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.3, ease }}
              >
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 transition-colors duration-300 ${
                    open ? "text-accent" : "text-content-muted"
                  }`}
                />
              </motion.div>
            </div>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease }}
                >
                  <p className="mt-3 pr-8 text-sm leading-relaxed text-content-secondary">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </button>
    </div>
  );

  if (!animationsEnabled) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay: index * 0.05 }}
    >
      {content}
    </motion.div>
  );
}
