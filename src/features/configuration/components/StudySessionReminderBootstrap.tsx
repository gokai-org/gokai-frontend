"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/shared/ui/ToastProvider";
import {
  parseSessionDurationMs,
  readStoredStudyBreakReminderPreferences,
  STUDY_BREAK_REMINDER_PREFERENCES_EVENT,
  STUDY_SESSION_ACTIVITY_EVENT,
  type StudyBreakReminderPreferences,
  type StudySessionActivityDetail,
} from "@/features/configuration/lib/studySessionReminder";

const SESSION_ACTIVITY_CHECK_INTERVAL_MS = 1000;
const SESSION_CONTINUATION_GRACE_MS = 90 * 1000;

function formatContinuousStudyDuration(elapsedMs: number) {
  const totalMinutes = Math.max(1, Math.floor(elapsedMs / 60000));

  if (totalMinutes >= 60 && totalMinutes % 60 === 0) {
    const hours = totalMinutes / 60;
    return hours === 1 ? "1 hora" : `${hours} horas`;
  }

  return `${totalMinutes} min`;
}

export function StudySessionReminderBootstrap() {
  const toast = useToast();
  const toastWarningRef = useRef(toast.warning);
  const preferencesRef = useRef(readStoredStudyBreakReminderPreferences());
  const activeSessionIdsRef = useRef<Set<string>>(new Set());
  const accumulatedMsRef = useRef(0);
  const activeStartedAtRef = useRef<number | null>(null);
  const lastNotifiedMilestoneRef = useRef(0);
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    toastWarningRef.current = toast.warning;
  }, [toast.warning]);

  useEffect(() => {
    const clearResetTimer = () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };

    const getElapsedMs = () => {
      if (activeStartedAtRef.current === null) {
        return accumulatedMsRef.current;
      }

      return accumulatedMsRef.current + (Date.now() - activeStartedAtRef.current);
    };

    const pauseTracking = () => {
      if (activeStartedAtRef.current === null) {
        return;
      }

      accumulatedMsRef.current += Date.now() - activeStartedAtRef.current;
      activeStartedAtRef.current = null;
    };

    const startTracking = () => {
      if (
        document.visibilityState !== "visible" ||
        activeStartedAtRef.current !== null ||
        activeSessionIdsRef.current.size === 0
      ) {
        return;
      }

      activeStartedAtRef.current = Date.now();
    };

    const syncLastNotifiedMilestone = (
      preferences = preferencesRef.current,
    ) => {
      const thresholdMs = parseSessionDurationMs(preferences.sessionDuration);

      if (thresholdMs <= 0) {
        lastNotifiedMilestoneRef.current = 0;
        return;
      }

      lastNotifiedMilestoneRef.current = Math.floor(getElapsedMs() / thresholdMs);
    };

    const resetTracking = () => {
      accumulatedMsRef.current = 0;
      activeStartedAtRef.current = null;
      lastNotifiedMilestoneRef.current = 0;
      clearResetTimer();
    };

    const scheduleReset = () => {
      clearResetTimer();
      resetTimerRef.current = window.setTimeout(() => {
        if (activeSessionIdsRef.current.size === 0) {
          resetTracking();
        }
      }, SESSION_CONTINUATION_GRACE_MS);
    };

    const handlePreferenceChange = (event: Event) => {
      const detail = (event as CustomEvent<StudyBreakReminderPreferences>).detail;
      preferencesRef.current = detail ?? readStoredStudyBreakReminderPreferences();
      syncLastNotifiedMilestone(preferencesRef.current);
    };

    const handleSessionActivity = (event: Event) => {
      const detail = (event as CustomEvent<StudySessionActivityDetail>).detail;

      if (!detail?.sessionId) {
        return;
      }

      const hadActiveSessions = activeSessionIdsRef.current.size > 0;

      if (detail.active) {
        activeSessionIdsRef.current.add(detail.sessionId);
      } else {
        activeSessionIdsRef.current.delete(detail.sessionId);
      }

      const hasActiveSessions = activeSessionIdsRef.current.size > 0;

      if (!hadActiveSessions && hasActiveSessions) {
        clearResetTimer();
        startTracking();
        return;
      }

      if (hadActiveSessions && !hasActiveSessions) {
        pauseTracking();
        scheduleReset();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        startTracking();
        return;
      }

      pauseTracking();
    };

    window.addEventListener(
      STUDY_BREAK_REMINDER_PREFERENCES_EVENT,
      handlePreferenceChange,
    );
    window.addEventListener(STUDY_SESSION_ACTIVITY_EVENT, handleSessionActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearResetTimer();
      window.removeEventListener(
        STUDY_BREAK_REMINDER_PREFERENCES_EVENT,
        handlePreferenceChange,
      );
      window.removeEventListener(
        STUDY_SESSION_ACTIVITY_EVENT,
        handleSessionActivity,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const preferences = preferencesRef.current;
      const thresholdMs = parseSessionDurationMs(preferences.sessionDuration);

      if (
        !preferences.breakReminders ||
        thresholdMs <= 0 ||
        activeStartedAtRef.current === null
      ) {
        return;
      }

      const elapsedMs =
        accumulatedMsRef.current + (Date.now() - activeStartedAtRef.current);
      const milestone = Math.floor(elapsedMs / thresholdMs);

      if (milestone <= lastNotifiedMilestoneRef.current) {
        return;
      }

      lastNotifiedMilestoneRef.current = milestone;

      toastWarningRef.current(
        `Llevas ${formatContinuousStudyDuration(elapsedMs)} estudiando de forma continua. Toca descansar un momento.`,
        6500,
      );
    }, SESSION_ACTIVITY_CHECK_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}