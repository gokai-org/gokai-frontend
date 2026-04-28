"use client";

import { memo, useEffect } from "react";
import { motion } from "framer-motion";

import { useKazuMascot } from "../hooks/useKazuMascot";
import type { KazuMascotProps } from "../types/kazuMascot.types";
import { KazuSvgMascot } from "./KazuSvgMascot";

export const KazuMascot = memo(function KazuMascot({
  state = "idle",
  correctSignal,
  wrongSignal,
  rewardSignal,
  size = 190,
  className,
  reducedMotion,
  focusOnHover = true,
  ariaLabel = "Kazu, mascota de GOKAI",
}: KazuMascotProps) {
  const {
    state: animatedState,
    setState,
    onFocus,
    onCorrect,
    onWrong,
    onReward,
  } = useKazuMascot({ initialState: state });

  useEffect(() => {
    setState(state);
  }, [setState, state]);

  useEffect(() => {
    if (typeof correctSignal !== "number") return;
    onCorrect();
  }, [correctSignal, onCorrect]);

  useEffect(() => {
    if (typeof wrongSignal !== "number") return;
    onWrong();
  }, [onWrong, wrongSignal]);

  useEffect(() => {
    if (typeof rewardSignal !== "number") return;
    onReward();
  }, [onReward, rewardSignal]);

  const handlePointerEnter = () => {
    if (!focusOnHover) return;
    onFocus();
  };

  const handlePointerLeave = () => {
    if (!focusOnHover) return;
    setState(state);
  };

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className={className}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      aria-label={ariaLabel}
    >
      <div className="relative mx-auto w-fit select-none">
        <KazuSvgMascot
          state={animatedState}
          size={size}
          reducedMotion={reducedMotion}
          className="drop-shadow-[0_18px_28px_rgba(31,26,48,0.14)] dark:drop-shadow-[0_18px_34px_rgba(0,0,0,0.28)]"
        />
        <div className="pointer-events-none absolute inset-x-8 bottom-4 h-4 rounded-full bg-accent/10 blur-md dark:bg-[#F7D77A]/10" />
      </div>
    </motion.div>
  );
});

KazuMascot.displayName = "KazuMascot";