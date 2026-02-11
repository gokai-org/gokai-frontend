"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook para proteger rutas autenticadas y manejar correctamente el historial del navegador
 * Previene que usuarios autenticados vuelvan al login usando el botón "atrás"
 */
export function useAuthProtection() {
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticación
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          // Usuario no autenticado, redirigir al login
          window.location.replace("/auth/login");
        }
      } catch (error) {
        // Error al verificar, redirigir al login
        window.location.replace("/auth/login");
      }
    }

    checkAuth();
  }, [router]);

  useEffect(() => {
    // Manejar navegación del historial
    function handlePopState(e: PopStateEvent) {
      // Verificar si está intentando volver a una página de auth
      if (window.location.pathname.startsWith("/auth")) {
        e.preventDefault();
        // Redirigir al dashboard
        window.location.replace("/dashboard/graph");
      }
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
}
