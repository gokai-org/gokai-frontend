"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResolvedPremiumAccess } from "@/shared/hooks/useResolvedPremiumAccess";

export function usePremiumRouteRedirect(redirectTo = "/dashboard/graph") {
  const router = useRouter();
  const { accessResolved, isPremium } = useResolvedPremiumAccess();

  useEffect(() => {
    if (!accessResolved || isPremium) {
      return;
    }

    router.replace(redirectTo);
  }, [accessResolved, isPremium, redirectTo, router]);

  return {
    accessResolved,
    isPremium,
  };
}