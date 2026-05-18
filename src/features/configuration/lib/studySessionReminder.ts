"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type GeneralSettings } from "@/features/configuration/types";

const BREAK_REMINDERS_ENABLED_STORAGE_KEY = "gokai-break-reminders-enabled";
const SESSION_DURATION_STORAGE_KEY = "gokai-session-duration";

export const STUDY_BREAK_REMINDER_PREFERENCES_EVENT =
  "gokai:study-break-reminder-preferences";
export const STUDY_SESSION_ACTIVITY_EVENT = "gokai:study-session-activity";

export type StudyBreakReminderPreferences = Pick<
  GeneralSettings,
  "breakReminders" | "sessionDuration"
>;

export type StudySessionActivityDetail = {
  sessionId: string;
  source: string;
  active: boolean;
};

function createFallbackSessionId() {
  return `study-session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function readStoredStudyBreakReminderPreferences(): StudyBreakReminderPreferences {
  const defaults = DEFAULT_SETTINGS.general;

  if (typeof window === "undefined") {
    return {
      breakReminders: defaults.breakReminders,
      sessionDuration: defaults.sessionDuration,
    };
  }

  try {
    const storedBreakReminders = localStorage.getItem(
      BREAK_REMINDERS_ENABLED_STORAGE_KEY,
    );
    const storedSessionDuration = localStorage.getItem(
      SESSION_DURATION_STORAGE_KEY,
    );

    return {
      breakReminders:
        storedBreakReminders === null
          ? defaults.breakReminders
          : storedBreakReminders === "true",
      sessionDuration:
        storedSessionDuration || defaults.sessionDuration,
    };
  } catch {
    return {
      breakReminders: defaults.breakReminders,
      sessionDuration: defaults.sessionDuration,
    };
  }
}

export function setStoredStudyBreakReminderPreferences(
  preferences: StudyBreakReminderPreferences,
) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      BREAK_REMINDERS_ENABLED_STORAGE_KEY,
      String(preferences.breakReminders),
    );
    localStorage.setItem(
      SESSION_DURATION_STORAGE_KEY,
      preferences.sessionDuration,
    );
  } catch {}

  window.dispatchEvent(
    new CustomEvent<StudyBreakReminderPreferences>(
      STUDY_BREAK_REMINDER_PREFERENCES_EVENT,
      { detail: preferences },
    ),
  );
}

export function parseSessionDurationMs(sessionDuration: string) {
  const match = sessionDuration.match(/(\d+)/);

  if (!match) {
    return 0;
  }

  const minutes = Number(match[1]);

  if (!Number.isFinite(minutes) || minutes <= 0) {
    return 0;
  }

  return minutes * 60 * 1000;
}

export function dispatchStudySessionActivity(
  detail: StudySessionActivityDetail,
) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<StudySessionActivityDetail>(STUDY_SESSION_ACTIVITY_EVENT, {
      detail,
    }),
  );
}

export function useStudySessionActivity(source: string, active = true) {
  const [sessionId] = useState(() => {
    const generatedSessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : createFallbackSessionId();

    return `${source}-${generatedSessionId}`;
  });

  useEffect(() => {
    if (!active) {
      return;
    }

    const detail = {
      sessionId,
      source,
      active: true,
    };

    dispatchStudySessionActivity(detail);

    return () => {
      dispatchStudySessionActivity({
        ...detail,
        active: false,
      });
    };
  }, [active, sessionId, source]);
}