"use client";

import { useState } from "react";

const ANIMATIONS_STORAGE_KEY = "gokai-ui-animations-enabled";

export function useChatbotPreferences() {
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(ANIMATIONS_STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  return {
    animationsEnabled,
    setAnimationsEnabled,
  };
}
