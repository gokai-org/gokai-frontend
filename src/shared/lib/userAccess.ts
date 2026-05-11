"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@/features/auth/types";

export interface UserAccessSnapshot {
  user: User | null;
  hasFullVocabularyAccess: boolean;
}

const DEFAULT_USER_ACCESS: UserAccessSnapshot = {
  user: null,
  hasFullVocabularyAccess: false,
};

let userAccessSnapshot = DEFAULT_USER_ACCESS;

const listeners = new Set<() => void>();

function notifyUserAccessChanged() {
  listeners.forEach((listener) => listener());
}

function subscribeToUserAccess(onStoreChange: () => void) {
  listeners.add(onStoreChange);

  return () => {
    listeners.delete(onStoreChange);
  };
}

function normalizePlan(plan?: User["plan"] | null) {
  return typeof plan === "string" ? plan.trim().toLowerCase() : "";
}

function hasFullAccess(user: User | null) {
  if (!user) {
    return false;
  }

  const normalizedPlan = normalizePlan(user.plan);

  return (
    user.subscribed === true ||
    normalizedPlan === "premium" ||
    normalizedPlan === "pro"
  );
}

export function setUserAccessUser(user: User | null) {
  userAccessSnapshot = {
    user,
    hasFullVocabularyAccess: hasFullAccess(user),
  };

  notifyUserAccessChanged();
}

export function getUserAccessSnapshot() {
  return userAccessSnapshot;
}

export function useUserAccess() {
  return useSyncExternalStore(
    subscribeToUserAccess,
    getUserAccessSnapshot,
    () => DEFAULT_USER_ACCESS,
  );
}