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

const MASTERED_MODULES_STORAGE_KEY = "gokai-mastered-modules";

let masteredModulesBootstrap: MasteredSet | null = null;

function normalizeMasteredModuleId(value: unknown): MasteryModuleId | null {
  return value === "hiragana" || value === "katakana" || value === "kanji"
    ? value
    : null;
}

function readMasteredModulesCache(): MasteredSet {
  if (masteredModulesBootstrap) {
    return new Set(masteredModulesBootstrap);
  }

  if (typeof window === "undefined") {
    return new Set<MasteryModuleId>();
  }

  try {
    const raw = window.localStorage.getItem(MASTERED_MODULES_STORAGE_KEY);
    if (!raw) {
      return new Set<MasteryModuleId>();
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set<MasteryModuleId>();
    }

    const next = new Set<MasteryModuleId>();
    for (const item of parsed) {
      const moduleId = normalizeMasteredModuleId(item);
      if (moduleId) {
        next.add(moduleId);
      }
    }

    masteredModulesBootstrap = next;
    return new Set(next);
  } catch {
    return new Set<MasteryModuleId>();
  }
}

function writeMasteredModulesCache(value: MasteredSet) {
  masteredModulesBootstrap = new Set(value);

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      MASTERED_MODULES_STORAGE_KEY,
      JSON.stringify(Array.from(value)),
    );
  } catch {
    // Ignore storage write failures.
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

type MasteredSet = ReadonlySet<MasteryModuleId>;

const MasteredModulesContext = createContext<MasteredSet>(
  new Set<MasteryModuleId>(),
);
const MasteredModulesLoadingContext = createContext<boolean>(true);

/**
 * Returns the set of modules the current user has mastered.
 * Can be called in any component inside `MasteredModulesProvider`.
 */
export function useMasteredModules(): MasteredSet {
  return useContext(MasteredModulesContext);
}

export function useMasteredModulesLoading(): boolean {
  return useContext(MasteredModulesLoadingContext);
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
    () => readMasteredModulesCache(),
  );
  const [loading, setLoading] = useState(true);

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
        writeMasteredModulesCache(set);
        setMastered(set);
      })
      .catch(() => {
        // Keep the empty set — graceful degradation.
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(
    () =>
      subscribeMasteryProgressSync((detail) => {
        setMastered((previous) => {
          const next = mergeMasteredModulesFromProgress(previous, detail);
          writeMasteredModulesCache(next);
          return next;
        });
      }),
    [],
  );

  return (
    <MasteredModulesLoadingContext.Provider value={loading}>
      <MasteredModulesContext.Provider value={mastered}>
        {children}
      </MasteredModulesContext.Provider>
    </MasteredModulesLoadingContext.Provider>
  );
}
