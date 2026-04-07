"use client";

import { motion } from "framer-motion";
import {
  MahjongSymbolBox,
  ShogiSymbolBox,
} from "@/features/library/components/ScriptCardLayout";

export type WritingTab = "hiragana" | "katakana" | "kanji";

const TABS: {
  id: WritingTab;
  label: string;
  symbol: string;
  color: string;
  glow: string;
  gradient: string;
  shape: "circle" | "mahjong" | "shogi";
}[] = [
  {
    id: "hiragana",
    label: "Hiragana",
    symbol: "あ",
    color: "#7B3F8A",
    glow: "rgba(123, 63, 138, 0.45)",
    gradient: "from-[#7B3F8A] to-[#A866B5]",
    shape: "shogi",
  },
  {
    id: "katakana",
    label: "Katakana",
    symbol: "ア",
    color: "#1B5078",
    glow: "rgba(27, 80, 120, 0.45)",
    gradient: "from-[#1B5078] to-[#2E82B5]",
    shape: "mahjong",
  },
  {
    id: "kanji",
    label: "Kanji",
    symbol: "漢",
    color: "#993331",
    glow: "rgba(153, 51, 49, 0.45)",
    gradient: "from-[#993331] to-[#BA5149]",
    shape: "circle",
  },
];

function WritingTabIcon({
  shape,
  symbol,
  gradient,
  isActive,
}: {
  shape: "circle" | "mahjong" | "shogi";
  symbol: string;
  gradient: string;
  isActive: boolean;
}) {
  const inactiveGradient =
    shape === "circle"
      ? "from-[#F5F3F9] to-[#EDEBF3] dark:from-[#4a464c] dark:to-[#2e2a30]"
      : "from-[#F5F3F9] to-[#EDEBF3] dark:from-[#4a464c] dark:to-[#2e2a30]";

  if (shape === "shogi") {
    return (
      <div className="scale-[0.72] sm:scale-[0.78] md:scale-[0.86]">
        <ShogiSymbolBox
          symbol={symbol}
          gradient={isActive ? gradient : inactiveGradient}
          hoverTransition=""
          textOverride={isActive ? "text-white" : "text-[#C4BDD2] dark:text-white/40"}
        />
      </div>
    );
  }

  if (shape === "mahjong") {
    return (
      <div className="scale-[0.72] sm:scale-[0.78] md:scale-[0.86]">
        <MahjongSymbolBox
          symbol={symbol}
          gradient={isActive ? gradient : inactiveGradient}
          hoverTransition=""
          textOverride={isActive ? "text-white" : "text-[#C4BDD2] dark:text-white/40"}
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "flex h-9 w-9 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-full border font-black leading-none",
        isActive
          ? `bg-gradient-to-br ${gradient} border-transparent text-white shadow-[0_4px_16px_rgba(153,51,49,0.28)]`
          : "border-border-subtle bg-gradient-to-br from-[#F5F3F9] to-[#EDEBF3] text-[#C4BDD2] dark:border-white/[0.08] dark:from-[#4a464c] dark:to-[#2e2a30] dark:text-white/40",
      ].join(" ")}
    >
      <span className="text-base sm:text-lg md:text-[22px]">{symbol}</span>
    </div>
  );
}

interface WritingSubMenuProps {
  activeTab: WritingTab;
  onTabChange: (tab: WritingTab) => void;
}

export default function WritingSubMenu({
  activeTab,
  onTabChange,
}: WritingSubMenuProps) {
  return (
    <div className="fixed top-[66px] sm:top-[78px] left-1/2 -translate-x-1/2 z-40 pointer-events-none">
      <motion.div
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -12, opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }}
        transition={{ delay: 0.35, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center gap-3 sm:gap-4 md:gap-6 rounded-2xl bg-surface-primary/60 backdrop-blur-xl px-3 py-2 sm:px-4 sm:py-2.5 md:px-6 md:py-3 shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="group relative flex flex-col items-center gap-1 sm:gap-1.5 outline-none"
            >
                <motion.div
                  className="relative flex items-center justify-center"
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.93 }}
                  animate={{ boxShadow: "none" }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                <WritingTabIcon
                  shape={tab.shape}
                  symbol={tab.symbol}
                  gradient={tab.gradient}
                  isActive={isActive}
                />
              </motion.div>

              {/* Label */}
              <span
                className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                  isActive ? "text-content-primary" : "text-content-muted group-hover:text-content-secondary"
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="writing-tab-indicator"
                  className="absolute -bottom-1 h-1 w-1 rounded-full"
                  style={{ backgroundColor: tab.color }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
}
