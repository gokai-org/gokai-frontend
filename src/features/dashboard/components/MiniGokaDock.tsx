"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getCurrentUser } from "@/features/auth";
import type { User } from "@/features/auth/types";
import {
  subscribeMasteryProgressSync,
  type MasteryProgressSyncDetail,
} from "@/features/mastery/utils/masteryProgressSync";
import { useAnimationPreferences } from "@/shared/hooks/useAnimationPreferences";

type PointsDelta = {
  id: number;
  value: number;
};

const pointsFormatter = new Intl.NumberFormat("es-ES");

function easeOutCubic(progress: number) {
  return 1 - (1 - progress) ** 3;
}

function createFallbackUser(): User {
  return {
    id: "",
    email: "",
    name: "Tu perfil",
    avatar: null,
    plan: "free",
    points: 0,
    kanaPoints: 0,
  };
}

function getDisplayPoints(user: User | null) {
  return Math.max(0, user?.points ?? 0);
}

function clampPositiveNumber(value: number) {
  return Math.max(0, value);
}

function mergeUserWithProgress(
  currentUser: User | null,
  detail: MasteryProgressSyncDetail,
) {
  const baseUser = currentUser ?? createFallbackUser();

  return {
    ...baseUser,
    ...(typeof detail.points === "number" ? { points: detail.points } : null),
    ...(typeof detail.kanaPoints === "number"
      ? { kanaPoints: detail.kanaPoints }
      : null),
  } satisfies User;
}

export function MiniGokaDock() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [animatedPoints, setAnimatedPoints] = useState(0);
  const [delta, setDelta] = useState<PointsDelta | null>(null);
  const lastKnownPointsRef = useRef<number | null>(null);
  const pointsAnimationFrameRef = useRef<number | null>(null);
  const animatedPointsRef = useRef(0);
  const deltaIdRef = useRef(0);
  const displayPoints = getDisplayPoints(user);
  const { animationsEnabled, heavyAnimationsEnabled } =
    useAnimationPreferences();

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const nextUser = await getCurrentUser();

        if (cancelled) {
          return;
        }

        setUser(nextUser);
        lastKnownPointsRef.current = getDisplayPoints(nextUser);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    const target = clampPositiveNumber(displayPoints);

    if (!animationsEnabled) {
      animatedPointsRef.current = target;
      setAnimatedPoints(target);
      return;
    }

    const from = animatedPointsRef.current;

    if (from === target) {
      return;
    }

    if (pointsAnimationFrameRef.current !== null) {
      cancelAnimationFrame(pointsAnimationFrameRef.current);
    }

    const duration =
      Math.abs(target - from) > 40
        ? heavyAnimationsEnabled
          ? 900
          : 700
        : heavyAnimationsEnabled
          ? 420
          : 280;
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
        pointsAnimationFrameRef.current = requestAnimationFrame(animate);
        return;
      }

      pointsAnimationFrameRef.current = null;
    };

    pointsAnimationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (pointsAnimationFrameRef.current !== null) {
        cancelAnimationFrame(pointsAnimationFrameRef.current);
        pointsAnimationFrameRef.current = null;
      }
    };
  }, [displayPoints, loading, animationsEnabled, heavyAnimationsEnabled]);

  useEffect(() => {
    return () => {
      if (pointsAnimationFrameRef.current !== null) {
        cancelAnimationFrame(pointsAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return subscribeMasteryProgressSync((detail) => {
      startTransition(() => {
        setUser((currentUser) => {
          const nextUser = mergeUserWithProgress(currentUser, detail);
          const nextPoints = getDisplayPoints(nextUser);
          const previousPoints = lastKnownPointsRef.current;

          lastKnownPointsRef.current = nextPoints;

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

          return nextUser;
        });
      });
    });
  }, []);

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
      heavyAnimationsEnabled ? 2200 : 1600,
    );

    return () => window.clearTimeout(timeoutId);
  }, [delta, heavyAnimationsEnabled]);

  const deltaToneClassName =
    (delta?.value ?? 0) >= 0
      ? "border-emerald-300/60 bg-emerald-500/18 text-emerald-700"
      : "border-rose-300/60 bg-rose-500/18 text-rose-700";
  const visibleAnimatedPoints = clampPositiveNumber(animatedPoints);
  const visibleDeltaValue = Math.abs(delta?.value ?? 0);

  return (
    <motion.aside
      initial={animationsEnabled ? { opacity: 0, x: 28, scale: 0.96 } : false}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={animationsEnabled ? { opacity: 0, x: 28, scale: 0.96 } : { opacity: 0 }}
      transition={{
        duration: heavyAnimationsEnabled ? 0.34 : 0.22,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative"
      aria-live="polite"
    >
      <div className="relative flex min-h-[32px] min-w-[84px] items-center justify-center rounded-full border border-white/90 bg-white/96 pl-7 pr-2.5 shadow-[0_10px_22px_rgba(15,23,42,0.1),0_3px_8px_rgba(148,163,184,0.1)] backdrop-blur-sm md:min-h-[34px] md:min-w-[92px] md:pl-7.5 md:pr-3 lg:min-h-[38px] lg:min-w-[102px] lg:pl-8 lg:pr-3.5">
        <div className="absolute left-0 top-1/2 flex h-7.5 w-7.5 -translate-x-[12%] -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-accent-hover to-accent shadow-[0_9px_18px_rgba(153,51,49,0.22)] ring-2 ring-white md:h-8 md:w-8 lg:h-9 lg:w-9">
          <div className="absolute inset-[4px] rounded-full border border-white/65" />
          <span className="relative text-[12px] font-black leading-none text-white drop-shadow-[0_1px_4px_rgba(122,23,20,0.24)] md:text-[13px] lg:text-[14px]">
            五
          </span>
        </div>

        <div className="relative flex w-full justify-center pl-2 leading-none text-center text-slate-700">
          <motion.span
            initial={animationsEnabled ? { opacity: 0, y: 4 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: heavyAnimationsEnabled ? 0.3 : 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="block min-w-[40px] text-center text-[14px] font-black tabular-nums tracking-[-0.03em] text-slate-700 md:min-w-[44px] md:text-[15px] lg:min-w-[48px] lg:text-[17px]"
          >
            {pointsFormatter.format(visibleAnimatedPoints)}
          </motion.span>

          <AnimatePresence>
            {delta && delta.value !== 0 ? (
              <motion.div
                key={delta.id}
                initial={
                  animationsEnabled ? { opacity: 0, y: 10, scale: 0.82 } : false
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={
                  animationsEnabled
                    ? { opacity: 0, y: -14, scale: 0.88 }
                    : { opacity: 0 }
                }
                transition={{
                  duration: heavyAnimationsEnabled ? 0.38 : 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`pointer-events-none absolute -right-1 -top-4 rounded-full border px-1 py-0.5 text-[7px] font-bold shadow-lg backdrop-blur-md lg:-top-5 ${deltaToneClassName}`}
              >
                {delta?.value && delta.value > 0 ? "+" : ""}
                {pointsFormatter.format(visibleDeltaValue)}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}