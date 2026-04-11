"use client";

import { useEffect, useState } from "react";
import {
  handleClientAuthFailure,
  redirectToLogin,
} from "@/shared/lib/api/client";

export function AuthenticatedUserGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<"checking" | "ready">("checking");

  useEffect(() => {
    let cancelled = false;

    async function verifyUser() {
      try {
        const response = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          const handled = handleClientAuthFailure(response);
          if (!handled) {
            redirectToLogin();
          }
          return;
        }

        const data = (await response.json().catch(() => null)) as
          | { user?: unknown }
          | null;

        if (!data?.user) {
          redirectToLogin();
          return;
        }

        if (!cancelled) {
          setStatus("ready");
        }
      } catch {
        redirectToLogin();
      }
    }

    void verifyUser();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status !== "ready") {
    return <div className="min-h-screen bg-surface-primary" />;
  }

  return <>{children}</>;
}