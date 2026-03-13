"use client";

import { useEffect } from "react";

/**
 * Componente que previene que el usuario vuelva al login usando el botón "atrás"
 * cuando está dentro del dashboard
 */
export function HistoryProtection() {
  useEffect(() => {
    let isProcessing = false;

    const handlePopState = () => {
      if (isProcessing) return;

      const currentPath = window.location.pathname;

      // Si está en el dashboard y presiona atrás, mantenerlo ahí
      if (currentPath.startsWith("/dashboard")) {
        isProcessing = true;
        window.history.pushState(null, "", currentPath);
        setTimeout(() => {
          isProcessing = false;
        }, 100);
      }
    };

    // Agregar una entrada al historial al montar
    window.history.pushState(null, "", window.location.href);

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
