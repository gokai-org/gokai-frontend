"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { WritingTab } from "./WritingSubMenu";
import { HiraganaView } from "../hiragana";
import { KatakanaView } from "../katakana";
import KanjisView from "@/features/graph/writing/kanjis/components/KanjisView";

const TRANSITION_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function WritingView() {
  const searchParams = useSearchParams();
  const activeTab = useMemo<WritingTab | null>(() => {
    const tab = searchParams.get("tab");
    return tab === "hiragana" || tab === "katakana" || tab === "kanji"
      ? tab
      : null;
  }, [searchParams]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        {activeTab === "kanji" && (
          <motion.div
            key="kanji"
            className="absolute inset-0"
            variants={TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <KanjisView />
          </motion.div>
        )}

        {activeTab === "hiragana" && (
          <motion.div
            key="hiragana"
            className="absolute inset-0"
            variants={TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <HiraganaView />
          </motion.div>
        )}

        {activeTab === "katakana" && (
          <motion.div
            key="katakana"
            className="absolute inset-0"
            variants={TRANSITION_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <KatakanaView />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
