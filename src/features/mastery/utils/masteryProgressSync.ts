import { MASTERY_THRESHOLDS } from "../constants/masteryConfig";
import type { MasteryModuleId } from "../types";

export const MASTERY_PROGRESS_SYNC_EVENT = "gokai:mastery-progress-sync";
export const MASTERY_CELEBRATION_REQUEST_EVENT = "gokai:mastery-celebration-request";

export type MasteryProgressSyncDetail = {
  points?: number | null;
  kanaPoints?: number | null;
};

export type MasteryCelebrationRequestDetail = {
  moduleId: MasteryModuleId;
};

export function dispatchMasteryProgressSync(
  detail: MasteryProgressSyncDetail,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MasteryProgressSyncDetail>(
      MASTERY_PROGRESS_SYNC_EVENT,
      { detail },
    ),
  );
}

export function dispatchMasteryCelebrationRequest(
  detail: MasteryCelebrationRequestDetail,
) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<MasteryCelebrationRequestDetail>(
      MASTERY_CELEBRATION_REQUEST_EVENT,
      { detail },
    ),
  );
}

export function subscribeMasteryProgressSync(
  listener: (detail: MasteryProgressSyncDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<MasteryProgressSyncDetail>;
    listener(customEvent.detail ?? {});
  };

  window.addEventListener(MASTERY_PROGRESS_SYNC_EVENT, handler);
  return () => window.removeEventListener(MASTERY_PROGRESS_SYNC_EVENT, handler);
}

export function subscribeMasteryCelebrationRequest(
  listener: (detail: MasteryCelebrationRequestDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<MasteryCelebrationRequestDetail>;
    listener(customEvent.detail);
  };

  window.addEventListener(MASTERY_CELEBRATION_REQUEST_EVENT, handler);
  return () =>
    window.removeEventListener(MASTERY_CELEBRATION_REQUEST_EVENT, handler);
}

export function mergeMasteredModulesFromProgress(
  previous: ReadonlySet<MasteryModuleId>,
  detail: MasteryProgressSyncDetail,
) {
  const next = new Set(previous);

  if (
    typeof detail.kanaPoints === "number" &&
    detail.kanaPoints >= MASTERY_THRESHOLDS.hiragana
  ) {
    next.add("hiragana");
  }

  if (
    typeof detail.kanaPoints === "number" &&
    detail.kanaPoints >= MASTERY_THRESHOLDS.katakana
  ) {
    next.add("katakana");
  }

  if (
    typeof detail.points === "number" &&
    detail.points >= MASTERY_THRESHOLDS.kanji
  ) {
    next.add("kanji");
  }

  return next;
}