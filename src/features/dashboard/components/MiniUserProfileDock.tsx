"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
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

function getTotalPoints(user: User | null) {
  return Math.max(0, (user?.points ?? 0) + (user?.kanaPoints ?? 0));
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

export function MiniUserProfileDock() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [delta, setDelta] = useState<PointsDelta | null>(null);
  const lastKnownTotalRef = useRef<number | null>(null);
  const deltaIdRef = useRef(0);
  const totalPoints = getTotalPoints(user);
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
        lastKnownTotalRef.current = getTotalPoints(nextUser);
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
    return subscribeMasteryProgressSync((detail) => {
      startTransition(() => {
        setUser((currentUser) => {
          const nextUser = mergeUserWithProgress(currentUser, detail);
          const nextTotal = getTotalPoints(nextUser);
          const previousTotal = lastKnownTotalRef.current;

          lastKnownTotalRef.current = nextTotal;

          if (typeof previousTotal === "number" && previousTotal !== nextTotal) {
            deltaIdRef.current += 1;
            setDelta({
              id: deltaIdRef.current,
              value: nextTotal - previousTotal,
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

  const countMotion = useMemo(
    () =>
      animationsEnabled
        ? {
            initial: { opacity: 0, y: 6, scale: 0.96 },
            animate: { opacity: 1, y: 0, scale: 1 },
            exit: { opacity: 0, y: -6, scale: 0.96 },
            transition: {
              duration: heavyAnimationsEnabled ? 0.28 : 0.18,
              ease: [0.22, 1, 0.36, 1] as const,
            },
          }
        : {
            initial: false,
            animate: {},
            exit: {},
            transition: { duration: 0 },
          },
    [animationsEnabled, heavyAnimationsEnabled],
  );

  const deltaToneClassName =
    (delta?.value ?? 0) >= 0
      ? "border-emerald-300/55 bg-emerald-500/14 text-emerald-700"
      : "border-rose-300/55 bg-rose-500/14 text-rose-700";

  return (
    <motion.aside
      initial={animationsEnabled ? { opacity: 0, y: -12, scale: 0.96 } : false}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: heavyAnimationsEnabled ? 0.32 : 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
      aria-live="polite"
    >
      <div className="relative flex min-w-[68px] max-w-[78px] flex-col items-center rounded-[14px] border border-border-default/70 bg-surface-primary/88 px-1.5 py-1.5 shadow-[0_8px_16px_rgba(15,23,42,0.1)] backdrop-blur-xl md:min-w-[74px] md:max-w-[84px] md:rounded-[15px] md:px-1.5 md:py-1.75 lg:min-w-[88px] lg:max-w-[98px] lg:rounded-[16px] lg:px-2 lg:py-2 lg:shadow-[0_10px_20px_rgba(15,23,42,0.12)]">
        <div className="relative flex h-7.5 w-7.5 shrink-0 items-center justify-center rounded-full border border-[#C35A54]/40 bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.34),transparent_24%),linear-gradient(145deg,#D4524F_0%,#BA5149_42%,#993331_100%)] shadow-[0_6px_12px_rgba(153,51,49,0.18)] md:h-8 md:w-8 lg:h-9 lg:w-9 lg:shadow-[0_8px_16px_rgba(153,51,49,0.22)]">
          <div className="absolute inset-[3px] rounded-full border border-white/18" />
          <span className="text-[9px] font-black leading-none text-white md:text-[10px] lg:text-[11px]">
            両
          </span>
        </div>

        <div className="mt-0.75 min-w-0 text-center md:mt-1">
          {loading ? (
            <div className="flex flex-col items-center gap-1">
              <div className="h-1.5 w-5 rounded-full bg-surface-secondary md:w-5.5 lg:h-2 lg:w-6" />
              <div className="h-4 w-7 rounded-full bg-surface-secondary md:h-4.5 md:w-8 lg:h-5 lg:w-9" />
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-0.5">
              <span className="text-[7px] font-semibold tracking-[0.14em] text-accent/82 uppercase md:text-[7.5px] md:tracking-[0.16em] lg:text-[8px] lg:tracking-[0.18em]">
                Ryo
              </span>

              <div className="leading-none text-content-primary">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span
                    key={totalPoints}
                    initial={countMotion.initial}
                    animate={countMotion.animate}
                    exit={countMotion.exit}
                    transition={countMotion.transition}
                    className="block text-[12px] font-black tabular-nums tracking-[-0.03em] text-content-primary md:text-[13px] lg:text-[15px]"
                  >
                    {pointsFormatter.format(totalPoints)}
                  </motion.span>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {delta && delta.value !== 0 ? (
                  <motion.div
                    key={delta.id}
                    initial={animationsEnabled ? { opacity: 0, y: 10, scale: 0.82 } : false}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={animationsEnabled ? { opacity: 0, y: -14, scale: 0.88 } : { opacity: 0 }}
                    transition={{ duration: heavyAnimationsEnabled ? 0.38 : 0.24, ease: [0.22, 1, 0.36, 1] }}
                    className={`pointer-events-none absolute -right-0.5 -top-3 rounded-full border px-1 py-0 text-[7px] font-bold shadow-lg backdrop-blur-md md:-right-1 md:-top-3.5 md:text-[7.5px] lg:-right-1.5 lg:-top-4 lg:px-1 lg:py-0.5 lg:text-[8px] ${deltaToneClassName}`}
                  >
                    {delta.value > 0 ? "+" : ""}
                    {pointsFormatter.format(delta.value)}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}