"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gokai-animations-enabled";
const HEAVY_STORAGE_KEY = "gokai-heavy-animations-enabled";

export function useAnimationPreferences() {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [heavyAnimationsEnabled, setHeavyAnimationsEnabled] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedAnimations = localStorage.getItem(STORAGE_KEY);
      const storedHeavyAnimations = localStorage.getItem(HEAVY_STORAGE_KEY);

      setAnimationsEnabled(storedAnimations !== "false");
      setHeavyAnimationsEnabled(storedHeavyAnimations !== "false");
    } catch {
      setAnimationsEnabled(true);
      setHeavyAnimationsEnabled(true);
    } finally {
      setIsReady(true);
    }
  }, []);

  const updateAnimationsEnabled = (value: boolean) => {
    setAnimationsEnabled(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {}
  };

  const updateHeavyAnimationsEnabled = (value: boolean) => {
    setHeavyAnimationsEnabled(value);
    try {
      localStorage.setItem(HEAVY_STORAGE_KEY, String(value));
    } catch {}
  };

  return {
    isReady,
    animationsEnabled,
    heavyAnimationsEnabled,
    setAnimationsEnabled: updateAnimationsEnabled,
    setHeavyAnimationsEnabled: updateHeavyAnimationsEnabled,
  };
}