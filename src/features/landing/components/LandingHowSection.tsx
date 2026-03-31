"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HOW_TABS,
  type HowTabId,
} from "@/features/landing/data/landingData";
import { staggerContainer, fadeUpSoft, EASE_BRAND } from "@/features/landing/lib/motionVariants";

interface LandingHowSectionProps {
  howTab: HowTabId;
  setHowTab: (tab: HowTabId) => void;
  how: (typeof HOW_TABS)[number];
}

export function LandingHowSection({
  howTab,
  setHowTab,
  how,
}: LandingHowSectionProps) {
  return (
    <div className="mt-8">
      {/* Imagen con transición al cambiar tab */}
      <motion.div
        variants={fadeUpSoft}
        className="mx-auto w-full max-w-[1280px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={howTab}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.35, ease: EASE_BRAND }}
            className="relative mx-auto aspect-[16/10] w-full overflow-visible"
          >
            <Image
              src={how.img}
              alt={how.label}
              fill
              className="object-contain drop-shadow-[0_24px_48px_rgba(0,0,0,0.20)]"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Tabs con stagger */}
      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-5"
        variants={staggerContainer(0.08, 0.1)}
      >
        {HOW_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => setHowTab(tab.id)}
            variants={fadeUpSoft}
            whileHover={{ y: -3, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className={[
              "relative min-w-[210px] rounded-full px-8 py-4 text-base font-bold transition-all duration-300 md:min-w-[250px] md:px-10 md:py-4 md:text-[1.05rem]",
              tab.id === howTab
                ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-[0_16px_34px_-14px_rgba(153,51,49,0.55)]"
                : "border border-border-subtle bg-surface-primary/85 text-content-secondary shadow-sm hover:border-accent/15 hover:text-accent hover:shadow-md",
            ].join(" ")}
          >
            {tab.id === howTab && (
              <motion.span
                layoutId="how-tab-indicator"
                className="absolute inset-0 rounded-full bg-gradient-to-r from-accent to-accent-hover"
                style={{ zIndex: -1 }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
              />
            )}
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}