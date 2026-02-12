"use client";

import { useEffect } from "react";

/**
 * Componente que maneja el historial en la página de login
 * Previene problemas con el botón atrás
 */
export function LoginHistoryHandler() {
  useEffect(() => {
    window.history.replaceState(
      { page: "login" },
      "",
      window.location.href
    );
  }, []);

  return null;
}
