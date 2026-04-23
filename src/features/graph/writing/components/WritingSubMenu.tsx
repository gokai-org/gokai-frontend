"use client";

import { motion } from "framer-motion";
import {
  MahjongSymbolBox,
  ShogiSymbolBox,
} from "@/features/library/components/ScriptCardLayout";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import type { MasteryModuleId } from "@/features/mastery/types";

export type WritingTab = "hiragana" | "katakana" | "kanji";

// ─── Golden override palette ────────────────────────────────────────────────

const GOLD = {
  color: "#D4A843",
  glow: "rgba(212, 168, 67, 0.45)",
  gradient: "from-[#D4A843] to-[#F0D27A]",
} as const;

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
      ? "from-[#E5E7EB] to-[#D6DAE1] dark:from-[#4a464c] dark:to-[#2e2a30]"
      : "from-[#E5E7EB] to-[#D6DAE1] dark:from-[#4a464c] dark:to-[#2e2a30]";
  const inactiveText = "text-[#8D96A5] dark:text-[#8f8793]";

  if (shape === "shogi") {
    return (
      <div className="scale-[0.72] sm:scale-[0.78] md:scale-[0.86]">
        <ShogiSymbolBox
          symbol={symbol}
          gradient={isActive ? gradient : inactiveGradient}
          hoverTransition=""
          textOverride={isActive ? "text-white" : inactiveText}
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
          textOverride={isActive ? "text-white" : inactiveText}
        />
      </div>
    );
  }

  return (
    <div
      className={[
        "flex h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 items-center justify-center rounded-full border font-black leading-none",
        isActive
          ? `bg-gradient-to-br ${gradient} border-transparent text-white shadow-[0_4px_16px_rgba(153,51,49,0.28)]`
          : "border-border-default bg-gradient-to-br from-[#E5E7EB] to-[#D6DAE1] text-[#8D96A5] dark:border-white/[0.08] dark:from-[#4a464c] dark:to-[#2e2a30] dark:text-[#8f8793]",
      ].join(" ")}
    >
      <span className="text-base sm:text-lg md:text-[22px]">{symbol}</span>
    </div>
  );
}

interface WritingSubMenuProps {
  activeTab: WritingTab | null;
  onTabChange: (tab: WritingTab) => void;
  anchorBottom?: boolean;
}

export default function WritingSubMenu({
  activeTab,
  onTabChange,
  anchorBottom = false,
}: WritingSubMenuProps) {
  const mastered = useMasteredModules();
  const verticalOffset = anchorBottom ? 8 : -8;

  return (
    <div
      data-help-target="writing-script-tabs"
      className={`fixed left-1/2 -translate-x-1/2 z-40 pointer-events-none ${
        anchorBottom ? "bottom-0" : "top-[68px] sm:top-[80px] md:top-[84px]"
      }`}
      style={
        anchorBottom
          ? { bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.85rem)" }
          : undefined
      }
    >
      <motion.div
        initial={{ y: verticalOffset, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: verticalOffset, opacity: 0, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } }}
        transition={{ delay: 0.12, duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-auto flex items-center gap-4 sm:gap-5 md:gap-6 rounded-2xl bg-surface-primary/60 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-3.5 shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const isMastered = mastered.has(tab.id as MasteryModuleId);
          const color = isMastered ? GOLD.color : tab.color;
          const gradient = isMastered ? GOLD.gradient : tab.gradient;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="group relative flex min-w-[72px] sm:min-w-[78px] md:min-w-[84px] flex-col items-center gap-2 sm:gap-2.5 outline-none"
            >
              <div className="flex h-11 items-center justify-center sm:h-12 md:h-14">
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
                    gradient={gradient}
                    isActive={isActive}
                  />
                </motion.div>
              </div>

              {/* Label */}
              <span
                className={`text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-[0.12em] transition-colors duration-200 ${
                  isActive ? "text-content-primary" : "text-content-muted group-hover:text-content-secondary"
                }`}
                style={isMastered && isActive ? { color: GOLD.color } : undefined}
              >
                {tab.label}
              </span>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  layoutId="writing-tab-indicator"
                  className="absolute -bottom-1.5 h-1 w-1 rounded-full"
                  style={{ backgroundColor: color }}
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
