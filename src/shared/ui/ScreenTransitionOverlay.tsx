"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

type ScreenTransitionOverlayProps = {
  active: boolean;
  title: string;
  description?: string;
};

export function ScreenTransitionOverlay({
  active,
  title,
  description,
}: ScreenTransitionOverlayProps) {
  const platformMotion = usePlatformMotion();
  const duration = platformMotion.shouldAnimate
    ? Math.max(0.24, 0.42 * platformMotion.durationScale)
    : 0.18;

  return (
    <AnimatePresence initial={false}>
      {active ? (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-surface-primary/76 px-6 backdrop-blur-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative w-full max-w-sm overflow-hidden rounded-[28px] border border-white/10 bg-surface-primary/90 px-6 py-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
            initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent-hover/10" />

            <div className="relative flex flex-col items-center gap-4">
              <motion.div
                className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover text-content-inverted shadow-[0_16px_36px_rgba(153,51,49,0.28)]"
                animate={{
                  scale: [1, 1.06, 1],
                  boxShadow: [
                    "0 16px 36px rgba(153,51,49,0.24)",
                    "0 20px 44px rgba(153,51,49,0.34)",
                    "0 16px 36px rgba(153,51,49,0.24)",
                  ],
                }}
                transition={{
                  duration: platformMotion.shouldAnimate ? 2.2 : 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full border border-white/20"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: platformMotion.shouldAnimate ? 9 : 5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <Sparkles className="h-7 w-7" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-xl font-extrabold tracking-tight text-content-primary">
                  {title}
                </h2>
                {description ? (
                  <p className="text-sm leading-relaxed text-content-secondary">
                    {description}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[0, 1, 2].map((index) => (
                  <motion.span
                    key={index}
                    className="h-2.5 w-2.5 rounded-full bg-accent"
                    animate={{
                      y: [0, -6, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: platformMotion.shouldAnimate ? 1.25 : 0.8,
                      repeat: Infinity,
                      delay: index * 0.16,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}