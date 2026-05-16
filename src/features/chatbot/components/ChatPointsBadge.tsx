"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/features/auth";
import { subscribeMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

type PointsDelta = {
  id: number;
  value: number;
};

const pointsFormatter = new Intl.NumberFormat("es-ES");

function clampPositiveNumber(value: number) {
  return Math.max(0, value);
}

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

export function ChatPointsBadge() {
  const [points, setPoints] = useState(0);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [delta, setDelta] = useState<PointsDelta | null>(null);
  const lastKnownPointsRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const animatedPointsRef = useRef(0);
  const deltaIdRef = useRef(0);
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      const user = await getCurrentUser().catch(() => null);

      if (cancelled) {
        return;
      }

      const nextPoints = clampPositiveNumber(user?.points ?? 0);
      lastKnownPointsRef.current = nextPoints;
      animatedPointsRef.current = nextPoints;
      setPoints(nextPoints);
      setAnimatedPoints(nextPoints);
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return subscribeMasteryProgressSync((detail) => {
      if (typeof detail.points !== "number") {
        return;
      }

      const nextPoints = clampPositiveNumber(detail.points);
      const previousPoints = lastKnownPointsRef.current;

      lastKnownPointsRef.current = nextPoints;
      setPoints(nextPoints);

      if (
        typeof previousPoints === "number" &&
        previousPoints !== nextPoints
      ) {
        deltaIdRef.current += 1;
        setDelta({
          id: deltaIdRef.current,
          value: nextPoints - previousPoints,
        });
      }
    });
  }, []);

  useEffect(() => {
    const target = clampPositiveNumber(points);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (!animationsEnabled) {
      animatedPointsRef.current = target;
      animationFrameRef.current = requestAnimationFrame(() => {
        setAnimatedPoints(target);
        animationFrameRef.current = null;
      });

      return () => {
        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    }

    const from = animatedPointsRef.current;

    if (from === target) {
      return;
    }

    const duration =
      Math.abs(target - from) > 40
        ? heavyAnimationsEnabled
          ? 850
          : 640
        : heavyAnimationsEnabled
          ? 420
          : 260;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const nextValue = clampPositiveNumber(
        Math.round(from + (target - from) * easedProgress),
      );

      animatedPointsRef.current = nextValue;
      setAnimatedPoints(nextValue);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      animationFrameRef.current = null;
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [animationsEnabled, heavyAnimationsEnabled, points]);

  useEffect(() => {
    if (!delta) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => {
        setDelta((currentDelta) =>
          currentDelta?.id === delta.id ? null : currentDelta,
        );
      },
      heavyAnimationsEnabled ? 1900 : 1400,
    );

    return () => window.clearTimeout(timeoutId);
  }, [delta, heavyAnimationsEnabled]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const deltaValue = delta?.value ?? 0;
  const isPositiveDelta = deltaValue > 0;
  const visibleDeltaValue = Math.abs(deltaValue);
  const visiblePoints = clampPositiveNumber(animatedPoints);

  return (
    <div className="relative">
      <AnimatePresence>
        {isPositiveDelta ? (
          <motion.div
            key={`chatbot-points-glow-${delta?.id}`}
            initial={{ opacity: 0.35, scale: 0.94 }}
            animate={{ opacity: 0, scale: 1.08 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0 rounded-[22px] border border-slate-300/80 bg-slate-200/40"
          />
        ) : null}
      </AnimatePresence>

      <motion.div
        animate={
          isPositiveDelta && animationsEnabled
            ? { scale: [1, 1.04, 1] }
            : { scale: 1 }
        }
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className="relative inline-flex h-11 min-w-[132px] items-center gap-3 overflow-hidden rounded-2xl border border-slate-200 bg-white px-3.5 py-2 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.38)]"
      >
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-hover to-accent text-white shadow-[0_10px_20px_-14px_rgba(153,51,49,0.76)]">
          <span className="absolute inset-[3px] rounded-full border border-white/40" />
          <Sparkles className="relative h-4 w-4" strokeWidth={2.2} />
        </div>

        <div className="flex min-w-0 flex-col justify-center gap-0.5 leading-none">
          <span className="block pt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Puntos
          </span>
          <motion.span
            initial={false}
            animate={
              isPositiveDelta && animationsEnabled
                ? { y: [0, -1, 0] }
                : { y: 0 }
            }
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="mt-1 block text-base font-extrabold tracking-[-0.04em] text-slate-700"
          >
            {pointsFormatter.format(visiblePoints)}
          </motion.span>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-[linear-gradient(180deg,rgba(248,250,252,0),rgba(226,232,240,0.46))]" />

        <AnimatePresence>
          {delta && deltaValue !== 0 ? (
            <motion.div
              key={delta.id}
              initial={
                animationsEnabled ? { opacity: 0, y: 10, scale: 0.84 } : false
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={
                animationsEnabled
                  ? { opacity: 0, y: -12, scale: 0.92 }
                  : { opacity: 0 }
              }
              transition={{
                duration: heavyAnimationsEnabled ? 0.36 : 0.24,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={[
                "pointer-events-none absolute -right-1.5 -top-2 rounded-full border bg-white px-2 py-1 text-[10px] font-bold shadow-lg backdrop-blur-md",
                deltaValue > 0
                  ? "border-emerald-200 text-emerald-700"
                  : "border-rose-200 text-rose-700",
              ].join(" ")}
              aria-live="polite"
            >
              {deltaValue > 0 ? "+" : "-"}
              {pointsFormatter.format(visibleDeltaValue)}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}