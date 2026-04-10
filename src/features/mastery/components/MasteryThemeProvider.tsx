"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CelebrationPhase, MasteryModuleId } from "../types";
import { MASTERY_GOLD, MASTERY_CSS_VARS } from "../utils/masteryColors";

// ---------------------------------------------------------------------------
// Context value
// ---------------------------------------------------------------------------

interface MasteryThemeContextValue {
  /** Whether the golden mastery theme is currently forcing colors. */
  isGolden: boolean;
  /** 0–1 mix ratio for CSS color-mix interpolation. */
  mixRatio: number;
  /** Current celebration phase (or "idle"). */
  phase: CelebrationPhase;
  /** Module being celebrated (or null). */
  moduleId: MasteryModuleId | null;
}

const MasteryThemeContext = createContext<MasteryThemeContextValue>({
  isGolden: false,
  mixRatio: 0,
  phase: "idle",
  moduleId: null,
});

export function useMasteryTheme() {
  return useContext(MasteryThemeContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface MasteryThemeProviderProps {
  children: ReactNode;
  /** 0 = normal, 1 = fully golden. Animated by the celebration orchestrator. */
  mixRatio?: number;
  /** Current celebration phase. */
  phase?: CelebrationPhase;
  /** Module being celebrated (drives per-module tint). */
  moduleId?: MasteryModuleId | null;
}

/**
 * Injects mastery golden CSS custom properties into the subtree.
 *
 * During a celebration, `mixRatio` ramps from 0→1 and the golden tokens
 * become available for any descendant component to consume via
 * `var(--mastery-gold-primary)` etc.
 *
 * Components that need to react to the golden state can also use
 * the `useMasteryTheme()` hook.
 */
export function MasteryThemeProvider({
  children,
  mixRatio = 0,
  phase = "idle",
  moduleId = null,
}: MasteryThemeProviderProps) {
  const isGolden = mixRatio > 0;

  const style = useMemo(() => {
    if (!isGolden) return undefined;

    return {
      [MASTERY_CSS_VARS.primary]: MASTERY_GOLD.primary,
      [MASTERY_CSS_VARS.highlight]: MASTERY_GOLD.highlight,
      [MASTERY_CSS_VARS.shadow]: MASTERY_GOLD.shadow,
      [MASTERY_CSS_VARS.glow]: MASTERY_GOLD.glow,
      [MASTERY_CSS_VARS.glowStrong]: MASTERY_GOLD.glowStrong,
      [MASTERY_CSS_VARS.backdrop]: MASTERY_GOLD.backdrop,
      [MASTERY_CSS_VARS.edgeStroke]: MASTERY_GOLD.edgeStroke,
      [MASTERY_CSS_VARS.gradientFrom]: MASTERY_GOLD.gradientFrom,
      [MASTERY_CSS_VARS.gradientTo]: MASTERY_GOLD.gradientTo,
      [MASTERY_CSS_VARS.mixRatio]: String(mixRatio),
    } as React.CSSProperties;
  }, [isGolden, mixRatio]);

  const contextValue = useMemo<MasteryThemeContextValue>(
    () => ({ isGolden, mixRatio, phase, moduleId }),
    [isGolden, mixRatio, phase, moduleId],
  );

  return (
    <MasteryThemeContext.Provider value={contextValue}>
      <div
        className="contents"
        data-mastery-golden={isGolden ? "true" : "false"}
        data-mastery-phase={phase}
        data-mastery-module={moduleId ?? ""}
        style={style}
      >
        {children}
      </div>
    </MasteryThemeContext.Provider>
  );
}
