"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import WritingSubMenu, { type WritingTab } from "./WritingSubMenu";
import { HiraganaView } from "../hiragana";
import { KatakanaView } from "../katakana";
import KanjisView from "@/features/graph/writing/kanjis/components/KanjisView";

const TRANSITION_VARIANTS = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export default function WritingView() {
  const [activeTab, setActiveTab] = useState<WritingTab>("kanji");
  const [subMenuVisible, setSubMenuVisible] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((tab: WritingTab) => {
    setActiveTab(tab);
    setSubMenuVisible(true);
  }, []);

  useEffect(() => {
    const toggle = () => setSubMenuVisible((v) => !v);
    window.addEventListener("writing-submenu-toggle", toggle);
    return () => window.removeEventListener("writing-submenu-toggle", toggle);
  }, []);

  // Click-outside: hide submenu when tapping anywhere except inside the menu
  // or the NavBar Escritura button (which has its own toggle logic).
  useEffect(() => {
    if (!subMenuVisible) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      if ((e.target as Element)?.closest("[data-writing-nav-escritura]")) return;
      setSubMenuVisible(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [subMenuVisible]);

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

      {/* Submenu floats above all boards — toggleable + click-outside */}
      <AnimatePresence>
        {subMenuVisible && (
          <div ref={menuRef} className="contents">
            <WritingSubMenu key="writing-submenu" activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
