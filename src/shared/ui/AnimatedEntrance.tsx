"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore, type ReactNode } from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

const defaultEase = [0.22, 1, 0.36, 1] as [number, number, number, number];
const SSR_DURATION_SCALE = 0.72;

function subscribeToHydration() {
  return () => {};
}

interface AnimatedEntranceProps {
  children: ReactNode;
  index?: number;
  className?: string;
  disabled?: boolean;
  delayStep?: number;
  duration?: number;
  offsetY?: number;
  exitOffsetY?: number;
  animateOnMount?: boolean;
  presence?: boolean;
  mode?: "default" | "light";
}

export function AnimatedEntrance({
  children,
  index = 0,
  className,
  disabled = false,
  delayStep = 0.08,
  duration = 0.5,
  offsetY = 16,
  exitOffsetY = 10,
  animateOnMount = true,
  presence = false,
  mode = "default",
}: AnimatedEntranceProps) {
  const platformMotion = usePlatformMotion();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const shouldAnimate = isHydrated ? platformMotion.shouldAnimate : true;
  const entranceMode = isHydrated ? platformMotion.entranceMode : "light";
  const durationScale = isHydrated
    ? platformMotion.durationScale
    : SSR_DURATION_SCALE;
  const shouldDisable = disabled || !shouldAnimate;

  if (shouldDisable) {
    return <div className={className}>{children}</div>;
  }

  const effectiveMode =
    mode === "light" || entranceMode === "light"
      ? "light"
      : "default";
  const isLight = effectiveMode === "light";

  const content = (
    <motion.div
      className={className}
      initial={
        animateOnMount
          ? {
              opacity: 0,
              y: isLight ? 8 : offsetY,
              scale: isLight ? 1 : 0.985,
            }
          : false
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
          delay: index * delayStep,
          duration: (isLight ? 0.28 : duration) * durationScale,
          ease: defaultEase,
        },
      }}
      exit={{
        opacity: 0,
        y: isLight ? 6 : exitOffsetY,
        scale: isLight ? 1 : 0.985,
        transition: {
          duration: (isLight ? 0.2 : 0.28) * durationScale,
          ease: defaultEase,
        },
      }}
      layout={effectiveMode === "default"}
    >
      {children}
    </motion.div>
  );

  if (!presence) return content;

  return <AnimatePresence mode="popLayout">{content}</AnimatePresence>;
}
