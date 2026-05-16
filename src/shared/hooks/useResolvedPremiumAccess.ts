"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { useUserAccess } from "@/shared/lib/userAccess";

export function useResolvedPremiumAccess() {
  const { user, isPremium } = useUserAccess();
  const [hasResolvedAccess, setHasResolvedAccess] = useState(false);

  useEffect(() => {
    let cancelled = false;

    if (user !== null) {
      return () => {
        cancelled = true;
      };
    }

    void getCurrentUser().finally(() => {
      if (!cancelled) {
        setHasResolvedAccess(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return {
    user,
    isPremium,
    accessResolved: user !== null || hasResolvedAccess,
  };
}