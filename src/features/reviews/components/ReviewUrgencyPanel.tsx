"use client";

import { motion } from "framer-motion";
import type { ReviewKanji } from "../types";
import { getPrimaryMeaning } from "@/features/kanji/utils/kanjiText";

/* ── Urgency helpers ──────────────────────────────────── */

function getUrgency(lastPracticed: string): "high" | "medium" | "low" {
  if (
    lastPracticed.includes("48h") ||
    lastPracticed.includes("3d") ||
    lastPracticed.includes("sem")
  )
    return "high";
  if (lastPracticed.includes("24h") || lastPracticed.includes("2d"))
    return "medium";
  return "low";
}

const urgencyStyles = {
  high: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  medium: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  low: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
};

const urgencyLabel = {
  high: "Urgente",
  medium: "Próximo",
  low: "Al día",
};

/* ── Component ────────────────────────────────────────── */

interface ReviewUrgencyPanelProps {
  items: ReviewKanji[];
}

export function ReviewUrgencyPanel({ items }: ReviewUrgencyPanelProps) {
  const grouped = {
    high: items.filter((i) => getUrgency(i.lastPracticed) === "high"),
    medium: items.filter((i) => getUrgency(i.lastPracticed) === "medium"),
    low: items.filter((i) => getUrgency(i.lastPracticed) === "low"),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="bg-surface-primary rounded-2xl p-6 shadow-sm border border-border-subtle"
    >
      <h3 className="text-lg font-extrabold text-content-primary mb-1">
        Prioridad de repaso
      </h3>
      <p className="text-xs text-content-tertiary mb-5">
        Kanji organizados por tiempo sin practicar
      </p>

      <div className="space-y-4">
        {(["high", "medium", "low"] as const).map((level) => {
          const group = grouped[level];
          if (group.length === 0) return null;
          const style = urgencyStyles[level];
          return (
            <div key={level}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                <span className={`text-xs font-bold ${style.text}`}>
                  {urgencyLabel[level]} ({group.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.map((item) => {
                  const meaning = getPrimaryMeaning(item.kanji.meanings) ?? "";
                  return (
                    <motion.div
                      key={item.kanji.id}
                      whileHover={{ scale: 1.08 }}
                      className={`${style.bg} px-3 py-1.5 rounded-xl flex items-center gap-2 cursor-default`}
                    >
                      <span className="text-base font-bold text-content-primary">
                        {item.kanji.symbol}
                      </span>
                      <span className="text-xs text-content-tertiary hidden sm:inline">
                        {meaning}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
