"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "gokai-animations-enabled";
const HEAVY_STORAGE_KEY = "gokai-heavy-animations-enabled";
export const ANIMATION_PREFERENCES_EVENT = "gokai-animation-preferences-changed";

function readAnimationPreferences() {
  try {
    return {
      animationsEnabled: localStorage.getItem(STORAGE_KEY) !== "false",
      heavyAnimationsEnabled: localStorage.getItem(HEAVY_STORAGE_KEY) !== "false",
    };
  } catch {
    return {
      animationsEnabled: true,
      heavyAnimationsEnabled: true,
    };
  }
}

function notifyAnimationPreferencesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANIMATION_PREFERENCES_EVENT));
}

export function useAnimationPreferences() {
  const [animationsEnabled, setAnimationsEnabled] = useState(
    () => readAnimationPreferences().animationsEnabled,
  );
  const [heavyAnimationsEnabled, setHeavyAnimationsEnabled] = useState(
    () => readAnimationPreferences().heavyAnimationsEnabled,
  );
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncPreferences = () => {
      const next = readAnimationPreferences();
      setAnimationsEnabled(next.animationsEnabled);
      setHeavyAnimationsEnabled(next.heavyAnimationsEnabled);
    };

    syncPreferences();
    setIsReady(true);

    window.addEventListener("storage", syncPreferences);
    window.addEventListener(ANIMATION_PREFERENCES_EVENT, syncPreferences);

    return () => {
      window.removeEventListener("storage", syncPreferences);
      window.removeEventListener(ANIMATION_PREFERENCES_EVENT, syncPreferences);
    };
  }, []);

  const updateAnimationsEnabled = (value: boolean) => {
    setAnimationsEnabled(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {}
    notifyAnimationPreferencesChanged();
  };

  const updateHeavyAnimationsEnabled = (value: boolean) => {
    setHeavyAnimationsEnabled(value);
    try {
      localStorage.setItem(HEAVY_STORAGE_KEY, String(value));
    } catch {}
    notifyAnimationPreferencesChanged();
  };

  return {
    isReady,
    animationsEnabled,
    heavyAnimationsEnabled,
    setAnimationsEnabled: updateAnimationsEnabled,
    setHeavyAnimationsEnabled: updateHeavyAnimationsEnabled,
  };
}
