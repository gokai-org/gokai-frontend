import type { MasteryModuleId } from "../types";

export const MASTERY_PROGRESS_SYNC_EVENT = "gokai:mastery-progress-sync";
export const MASTERY_CELEBRATION_REQUEST_EVENT = "gokai:mastery-celebration-request";

export type MasteryProgressSyncDetail = {
  points?: number | null;
  kanaPoints?: number | null;
  hasHiraganaMastery?: boolean | null;
  hasKatakanaMastery?: boolean | null;
  hasKanaMastery?: boolean | null;
  hasKanasMastery?: boolean | null;
  hasKanjiMastery?: boolean | null;
  hasGrammarMastery?: boolean | null;
  masteredModules?: MasteryModuleId[] | null;
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

  for (const moduleId of detail.masteredModules ?? []) {
    next.add(moduleId);
  }

  if (detail.hasHiraganaMastery === true || detail.hasKanaMastery === true) {
    next.add("hiragana");
  }

  if (detail.hasKatakanaMastery === true || detail.hasKanasMastery === true) {
    next.add("katakana");
  }

  if (detail.hasKanjiMastery === true) {
    next.add("kanji");
  }

  if (detail.hasGrammarMastery === true) {
    next.add("grammar");
  }

  return next;
}