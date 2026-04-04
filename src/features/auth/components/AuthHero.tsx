"use client";

import { motion, AnimatePresence } from "framer-motion";
import ProgressDots from "@/features/auth/components/ProgressDots";

type HeroMessage = {
  jp: string;
  es: string;
};

type Props = {
  hero: HeroMessage;
  heroIndex: number;
};

export function AuthHero({ hero, heroIndex }: Props) {
  return (
    <motion.section
      className="hidden xl:block absolute left-6 bottom-10 z-20 pointer-events-none"
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <div className="max-w-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-2xl font-medium tracking-wide text-content-primary">
              {hero.jp}
            </p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-content-primary">
              {hero.es}
            </h1>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6">
          <ProgressDots activeIndex={heroIndex} />
        </div>
      </div>
    </motion.section>
  );
}
