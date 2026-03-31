"use client";

/**
 * SettingsBootstrap
 *
 * Se monta silenciosamente en el layout del dashboard.
 * Carga los settings del usuario desde el backend una sola vez y los aplica:
 *  - appearance.darkMode   → ThemeProvider (setTheme) + localStorage gokai-theme
 *  - accessibility.reduceAnimations → localStorage gokai-animations-enabled
 *  - accessibility.highContrast     → clase CSS high-contrast en <html>
 *
 * No renderiza nada visible.
 */

import { useEffect, useRef } from "react";
import { useTheme } from "@/shared/hooks/useTheme";
import { getUserSettings } from "@/features/configuration/services/api";

const ANIM_KEY        = "gokai-animations-enabled";
const HEAVY_ANIM_KEY  = "gokai-heavy-animations-enabled";

export function SettingsBootstrap() {
  const { setTheme } = useTheme();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    getUserSettings()
      .then((settings) => {
        if (!settings) return;

        // ── Tema ───────────────────────────────────────────────
        setTheme(settings.appearance.darkMode ? "dark" : "light");

        // ── Animaciones ────────────────────────────────────────
        const noAnim = settings.accessibility.reduceAnimations;
        try {
          localStorage.setItem(ANIM_KEY,       String(!noAnim));
          localStorage.setItem(HEAVY_ANIM_KEY, String(!noAnim));
        } catch {}

        // ── Alto contraste ─────────────────────────────────────
        document.documentElement.classList.toggle(
          "high-contrast",
          settings.accessibility.highContrast,
        );
      })
      .catch(() => {
        // No bloquear la app si falla — los defaults del ThemeProvider aplican
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
