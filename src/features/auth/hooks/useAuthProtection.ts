"use client";

import { useEffect } from "react";
import { handleClientAuthFailure, redirectToLogin } from "@/shared/lib/api/client";

/**
 * Hook para proteger rutas autenticadas y manejar correctamente el historial del navegador
 * Previene que usuarios autenticados vuelvan al login usando el botón "atrás"
 */
export function useAuthProtection() {
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          const handled = handleClientAuthFailure(res);
          if (!handled) {
            redirectToLogin();
          }
        }
      } catch {
        redirectToLogin();
      }
    }

    checkAuth();
  }, []);

  useEffect(() => {
    function handlePopState(e: PopStateEvent) {
      if (window.location.pathname.startsWith("/auth")) {
        e.preventDefault();
        window.location.replace("/dashboard/graph");
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
