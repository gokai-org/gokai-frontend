"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gokai-animations-enabled";
const HEAVY_STORAGE_KEY = "gokai-heavy-animations-enabled";
export const ANIMATION_PREFERENCES_EVENT = "gokai-animation-preferences-changed";

const DEFAULT_ANIMATION_PREFERENCE = true;

function readAnimationPreferences() {
  if (typeof window === "undefined") {
    return {
      animationsEnabled: DEFAULT_ANIMATION_PREFERENCE,
      heavyAnimationsEnabled: DEFAULT_ANIMATION_PREFERENCE,
    };
  }

  try {
    return {
      animationsEnabled: window.localStorage.getItem(STORAGE_KEY) !== "false",
      heavyAnimationsEnabled: window.localStorage.getItem(HEAVY_STORAGE_KEY) !== "false",
    };
  } catch {
    return {
      animationsEnabled: DEFAULT_ANIMATION_PREFERENCE,
      heavyAnimationsEnabled: DEFAULT_ANIMATION_PREFERENCE,
    };
  }
}

function subscribeToAnimationPreferences(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ANIMATION_PREFERENCES_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(ANIMATION_PREFERENCES_EVENT, onStoreChange);
  };
}

function notifyAnimationPreferencesChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANIMATION_PREFERENCES_EVENT));
}

export function useAnimationPreferences() {
  const animationsEnabled = useSyncExternalStore(
    subscribeToAnimationPreferences,
    () => readAnimationPreferences().animationsEnabled,
    () => DEFAULT_ANIMATION_PREFERENCE,
  );
  const heavyAnimationsEnabled = useSyncExternalStore(
    subscribeToAnimationPreferences,
    () => readAnimationPreferences().heavyAnimationsEnabled,
    () => DEFAULT_ANIMATION_PREFERENCE,
  );
  const isReady = true;

  const updateAnimationsEnabled = (value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value));
    } catch {}
    notifyAnimationPreferencesChanged();
  };

  const updateHeavyAnimationsEnabled = (value: boolean) => {
    try {
      window.localStorage.setItem(HEAVY_STORAGE_KEY, String(value));
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
