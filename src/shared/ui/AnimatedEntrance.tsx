"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

const defaultEase = [0.22, 1, 0.36, 1] as [number, number, number, number];

interface AnimatedEntranceProps {
  children: ReactNode;
  index?: number;
  className?: string;
  disabled?: boolean;
  delayStep?: number;
  duration?: number;
  offsetY?: number;
}

export function AnimatedEntrance({
  children,
  index = 0,
  className,
  disabled = false,
  delayStep = 0.08,
  duration = 0.5,
  offsetY = 16,
}: AnimatedEntranceProps) {
  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offsetY }}
      animate={{
        opacity: 1,
        y: 0,
        transition: {
          delay: index * delayStep,
          duration,
          ease: defaultEase,
        },
      }}
    >
      {children}
    </motion.div>
  );
}