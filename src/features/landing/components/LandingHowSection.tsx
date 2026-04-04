"use client";

import Image from "next/image";
import { useRef } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { HOW_TABS, type HowTabId } from "@/features/landing/data/landingData";
import {
  staggerContainer,
  fadeUpSoft,
  EASE_BRAND,
} from "@/features/landing/lib/motionVariants";

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
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const stageY = useTransform(scrollYProgress, [0, 1], [28, -14]);
  const stageRotate = useTransform(scrollYProgress, [0, 1], [2, -1.5]);

  return (
    <motion.div
      ref={ref}
      className="mt-2 sm:mt-4"
      variants={staggerContainer(0.08, 0.04)}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 sm:gap-5">
        <motion.div
          variants={fadeUpSoft}
          style={{
            y: stageY,
            rotateX: stageRotate,
            transformPerspective: 1800,
          }}
          className="relative w-full"
        >
          <div className="relative aspect-[16/8.5] w-full overflow-visible">
            <AnimatePresence mode="wait">
              <motion.div
                key={howTab}
                initial={{ opacity: 0, scale: 0.97, y: 18 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.985, y: -10 }}
                transition={{ duration: 0.4, ease: EASE_BRAND }}
                className="absolute inset-0"
              >
                <Image
                  src={how.img}
                  alt={how.label}
                  fill
                  className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.28)]"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="w-full overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:overflow-visible">
          <motion.div
            className="mx-auto flex w-max min-w-full items-stretch gap-2 px-0.5 sm:grid sm:w-full sm:max-w-4xl sm:grid-cols-3 sm:gap-3 sm:px-0"
            variants={staggerContainer(0.06, 0.05)}
          >
            {HOW_TABS.map((tab) => (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => setHowTab(tab.id)}
                aria-pressed={tab.id === howTab}
                variants={fadeUpSoft}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.985 }}
                className={[
                  "min-w-[138px] rounded-full border px-3 py-2.5 text-center transition-all duration-300 sm:min-w-0 sm:px-5 sm:py-3.5",
                  tab.id === howTab
                    ? "border-accent/25 bg-accent text-content-inverted shadow-[0_16px_36px_-20px_rgba(153,51,49,0.75)]"
                    : "border-border-default/70 bg-surface-primary/72 text-content-primary hover:border-accent/18 hover:bg-surface-primary/88",
                ].join(" ")}
              >
                <span className="block text-xs font-semibold leading-tight sm:text-base">
                  {tab.label}
                </span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
