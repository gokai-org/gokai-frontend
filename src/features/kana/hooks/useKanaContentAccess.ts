"use client";

import {
  useMasteredModules,
  useMasteredModulesLoading,
} from "@/features/mastery/components/MasteredModulesProvider";
import { KANA_ACCESS_REQUIREMENT_MESSAGE } from "../lib/kanaMastery";

export function useKanaContentAccess() {
  const masteredModules = useMasteredModules();
  const loading = useMasteredModulesLoading();
  const hasHiraganaMastery = masteredModules.has("hiragana");
  const hasKatakanaMastery = masteredModules.has("katakana");
  const hasKanaContentAccess = hasHiraganaMastery && hasKatakanaMastery;

  return {
    loading,
    hasHiraganaMastery,
    hasKatakanaMastery,
    hasKanaContentAccess,
    blockedMessage: KANA_ACCESS_REQUIREMENT_MESSAGE,
  };
}