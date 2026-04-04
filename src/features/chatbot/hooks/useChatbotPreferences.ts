"use client";

import { useEffect, useState } from "react";

const ANIMATIONS_STORAGE_KEY = "gokai-ui-animations-enabled";

export function useChatbotPreferences() {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(ANIMATIONS_STORAGE_KEY);
      if (stored === null) {
        setAnimationsEnabled(true);
        return;
      }

      setAnimationsEnabled(stored === "true");
    } catch {
      setAnimationsEnabled(true);
    }
  }, []);

  return {
    animationsEnabled,
    setAnimationsEnabled,
  };
}
