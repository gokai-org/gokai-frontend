"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "@/features/auth/services/api";
import { MASTERY_THRESHOLDS } from "../constants/masteryConfig";
import type { MasteryModuleId } from "../types";
import {
  mergeMasteredModulesFromProgress,
  subscribeMasteryProgressSync,
} from "../utils/masteryProgressSync";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type MasteredSet = ReadonlySet<MasteryModuleId>;

const MasteredModulesContext = createContext<MasteredSet>(
  new Set<MasteryModuleId>(),
);

/**
 * Returns the set of modules the current user has mastered.
 * Can be called in any component inside `MasteredModulesProvider`.
 */
export function useMasteredModules(): MasteredSet {
  return useContext(MasteredModulesContext);
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

/**
 * Fetches the current user once on mount and computes which modules have been
 * mastered based on their point thresholds.  Place this near the root of the
 * authenticated layout so that all downstream components (library cards, board
 * nodes, etc.) can read the mastered set via `useMasteredModules()`.
 */
export function MasteredModulesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [mastered, setMastered] = useState<MasteredSet>(
    new Set<MasteryModuleId>(),
  );

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        if (!user) return;
        const set = new Set<MasteryModuleId>();
        const kana = user.kanaPoints ?? 0;
        const pts = user.points ?? 0;
        if (kana >= MASTERY_THRESHOLDS.hiragana) set.add("hiragana");
        if (kana >= MASTERY_THRESHOLDS.katakana) set.add("katakana");
        if (pts >= MASTERY_THRESHOLDS.kanji) set.add("kanji");
        setMastered(set);
      })
      .catch(() => {
        // Keep the empty set — graceful degradation.
      });
  }, []);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        setMastered((previous) =>
          mergeMasteredModulesFromProgress(previous, detail),
        );
      }),
    [],
  );

  return (
    <MasteredModulesContext.Provider value={mastered}>
      {children}
    </MasteredModulesContext.Provider>
  );
}
