import { useCallback, useEffect, useRef, useState } from "react";

import type {
  KazuMascotState,
  UseKazuMascotOptions,
  UseKazuMascotReturn,
} from "../types/kazuMascot.types";

const DEFAULT_AUTO_IDLE_DELAY_MS = {
  correct: 1500,
  wrong: 1700,
  reward: 2400,
} satisfies Record<"correct" | "wrong" | "reward", number>;

const DEFAULT_INACTIVITY_DELAY_MS = 45000;

export function useKazuMascot({
  initialState = "idle",
  autoIdleDelayMs,
  inactivityDelayMs = DEFAULT_INACTIVITY_DELAY_MS,
}: UseKazuMascotOptions = {}): UseKazuMascotReturn {
  const [state, setCurrentState] = useState<KazuMascotState>(initialState);
  const autoIdleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sleepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAutoIdleTimer = useCallback(() => {
    if (!autoIdleTimer.current) return;
    clearTimeout(autoIdleTimer.current);
    autoIdleTimer.current = null;
  }, []);

  const clearSleepTimer = useCallback(() => {
    if (!sleepTimer.current) return;
    clearTimeout(sleepTimer.current);
    sleepTimer.current = null;
  }, []);

  const armSleepTimer = useCallback(() => {
    clearSleepTimer();
    if (inactivityDelayMs <= 0) return;

    sleepTimer.current = setTimeout(() => {
      setCurrentState((current) => (current === "idle" ? "sleep" : current));
    }, inactivityDelayMs);
  }, [clearSleepTimer, inactivityDelayMs]);

  const setState = useCallback(
    (nextState: KazuMascotState) => {
      clearAutoIdleTimer();
      clearSleepTimer();
      setCurrentState(nextState);

      if (nextState === "idle") {
        armSleepTimer();
        return;
      }

      if (
        nextState === "correct" ||
        nextState === "wrong" ||
        nextState === "reward"
      ) {
        const delay =
          autoIdleDelayMs?.[nextState] ?? DEFAULT_AUTO_IDLE_DELAY_MS[nextState];
        autoIdleTimer.current = setTimeout(() => {
          setCurrentState("idle");
          armSleepTimer();
        }, delay);
      }
    },
    [armSleepTimer, autoIdleDelayMs, clearAutoIdleTimer, clearSleepTimer],
  );

  const onFocus = useCallback(() => setState("focus"), [setState]);
  const onCorrect = useCallback(() => setState("correct"), [setState]);
  const onWrong = useCallback(() => setState("wrong"), [setState]);
  const onReward = useCallback(() => setState("reward"), [setState]);
  const onIdle = useCallback(() => setState("idle"), [setState]);
  const onSleep = useCallback(() => setState("sleep"), [setState]);

  useEffect(() => {
    if (initialState === "idle") armSleepTimer();

    return () => {
      clearAutoIdleTimer();
      clearSleepTimer();
    };
  }, [armSleepTimer, clearAutoIdleTimer, clearSleepTimer, initialState]);

  return {
    state,
    setState,
    onFocus,
    onCorrect,
    onWrong,
    onReward,
    onIdle,
    onSleep,
  };
}
