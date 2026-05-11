"use client";

import { useSyncExternalStore } from "react";
import type { User } from "@/features/auth/types";

export type VocabularyThemeUnlockScope = "selected" | "all";

export interface UserEntitlements {
  isPremium: boolean;
  hasFullVocabularyAccess: boolean;
  vocabularyThemeUnlockScope: VocabularyThemeUnlockScope;
}

export interface UserAccessSnapshot {
  user: User | null;
  isPremium: boolean;
  hasFullVocabularyAccess: boolean;
  vocabularyThemeUnlockScope: VocabularyThemeUnlockScope;
}

const DEFAULT_USER_ACCESS: UserAccessSnapshot = {
  user: null,
  isPremium: false,
  hasFullVocabularyAccess: false,
  vocabularyThemeUnlockScope: "selected",
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

export function hasPremiumAccess(user: User | null | undefined) {
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

export function getUserEntitlements(
  user: User | null | undefined,
): UserEntitlements {
  const isPremium = hasPremiumAccess(user);

  return {
    isPremium,
    hasFullVocabularyAccess: isPremium,
    vocabularyThemeUnlockScope: isPremium ? "all" : "selected",
  };
}

export function getUserAccessSnapshotForUser(
  user: User | null | undefined,
): UserAccessSnapshot {
  const resolvedUser = user ?? null;
  const entitlements = getUserEntitlements(resolvedUser);

  return {
    user: resolvedUser,
    ...entitlements,
  };
}

export function setUserAccessUser(user: User | null) {
  userAccessSnapshot = getUserAccessSnapshotForUser(user);

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