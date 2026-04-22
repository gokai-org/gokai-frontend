"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useShakeFeedback<T>(durationMs: number) {
  const timerRef = useRef<number | null>(null);
  const [shakingKey, setShakingKey] = useState<T | null>(null);

  const clearShake = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setShakingKey(null);
  }, []);

  const triggerShake = useCallback(
    (key: T) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      setShakingKey(null);

      window.requestAnimationFrame(() => {
        setShakingKey(key);
        timerRef.current = window.setTimeout(() => {
          setShakingKey(null);
          timerRef.current = null;
        }, durationMs);
      });
    },
    [durationMs],
  );

  useEffect(() => clearShake, [clearShake]);

  return {
    shakingKey,
    triggerShake,
    clearShake,
  };
}