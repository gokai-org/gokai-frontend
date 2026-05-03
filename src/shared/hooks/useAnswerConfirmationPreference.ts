"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "gokai-confirm-answers-enabled";
export const ANSWER_CONFIRMATION_PREFERENCE_EVENT =
  "gokai-answer-confirmation-changed";

const DEFAULT_CONFIRM_ANSWERS = true;

function readAnswerConfirmationPreference() {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIRM_ANSWERS;
  }

  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "false";
  } catch {
    return DEFAULT_CONFIRM_ANSWERS;
  }
}

function subscribeToAnswerConfirmationPreference(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(ANSWER_CONFIRMATION_PREFERENCE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(
      ANSWER_CONFIRMATION_PREFERENCE_EVENT,
      onStoreChange,
    );
  };
}

export function notifyAnswerConfirmationPreferenceChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ANSWER_CONFIRMATION_PREFERENCE_EVENT));
}

export function setStoredAnswerConfirmationPreference(value: boolean) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {}

  notifyAnswerConfirmationPreferenceChanged();
}

export function useAnswerConfirmationPreference() {
  const confirmAnswersEnabled = useSyncExternalStore(
    subscribeToAnswerConfirmationPreference,
    readAnswerConfirmationPreference,
    () => DEFAULT_CONFIRM_ANSWERS,
  );

  return {
    confirmAnswersEnabled,
    setConfirmAnswersEnabled: setStoredAnswerConfirmationPreference,
  };
}
