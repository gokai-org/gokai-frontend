"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  HOW_TABS,
  type HowTabId,
} from "@/features/landing/data/landingData";

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
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto w-full max-w-[1280px]"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={howTab}
            initial={{ opacity: 0, y: 18, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -18, scale: 0.985 }}
            transition={{ duration: 0.35 }}
            className="relative mx-auto aspect-[16/10] w-full overflow-visible"
          >
            <Image
              src={how.img}
              alt={how.label}
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <motion.div
        className="mt-8 flex flex-wrap items-center justify-center gap-4 md:gap-5"
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.12, duration: 0.45 }}
      >
        {HOW_TABS.map((tab, idx) => (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => setHowTab(tab.id)}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.18 + idx * 0.07, duration: 0.35 }}
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className={[
              "relative min-w-[210px] rounded-full px-8 py-4 text-base font-bold transition-all duration-300 md:min-w-[250px] md:px-10 md:py-4 md:text-[1.05rem]",
              tab.id === howTab
                ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-[0_16px_34px_-14px_rgba(153,51,49,0.55)]"
                : "border border-border-subtle bg-surface-primary/85 text-content-secondary shadow-sm hover:border-accent/10 hover:text-accent",
            ].join(" ")}
          >
            {tab.label}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}