"use client";

import { useEffect } from "react";

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
        });

        if (!res.ok) {
          window.location.replace("/auth/login");
        }
      } catch {
        window.location.replace("/auth/login");
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