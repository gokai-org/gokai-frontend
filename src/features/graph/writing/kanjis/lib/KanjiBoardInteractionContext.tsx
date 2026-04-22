"use client";

import { createContext, useContext } from "react";

export const KANJI_UNLOCK_HOLD_DURATION_MS = 720;

export interface KanjiBoardInteraction {
  onPressUnlock: (nodeId: string) => void;
  unlockPendingId: string | null;
  recentlyUnlockedIds?: ReadonlySet<string>;
}

const KanjiBoardInteractionContext = createContext<KanjiBoardInteraction | null>(
  null,
);

export const KanjiBoardInteractionProvider =
  KanjiBoardInteractionContext.Provider;

export function useKanjiBoardInteraction(): KanjiBoardInteraction | null {
  return useContext(KanjiBoardInteractionContext);
}
