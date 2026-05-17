"use client";

/**
 * SettingsBootstrap
 *
 * Se monta silenciosamente en el layout del dashboard.
 * Carga los settings del usuario desde el backend una sola vez y los aplica:
 *  - appearance.darkMode       → ThemeProvider (setTheme) + localStorage gokai-theme
 *  - appearance.fontSize       → TypographyProvider (setFontSize)
 *  - appearance.japaneseFont   → TypographyProvider (setJapaneseFont)
 *  - accessibility.reduceAnimations → localStorage gokai-animations-enabled
 *  - accessibility.audioSpeed  → localStorage gokai-audio-speed
 *  - general.confirmAnswers    → localStorage gokai-confirm-answers-enabled
 *  - accessibility.highContrast     → clase CSS high-contrast en <html>
 *
 * No renderiza nada visible.
 */

import { useEffect, useRef } from "react";
import { ANIMATION_PREFERENCES_EVENT } from "@/shared/hooks/useAnimationPreferences";
import { setStoredAnswerConfirmationPreference } from "@/shared/hooks/useAnswerConfirmationPreference";
import { setStoredAudioSpeed } from "@/shared/hooks/useAudioPlaybackRate";
import { useTheme } from "@/shared/hooks/useTheme";
import { useTypography } from "@/shared/hooks/useTypography";
import {
  normalizeFontSize,
  normalizeJapaneseFont,
} from "@/shared/hooks/useTypography";
import { getUserSettings } from "@/features/configuration/services/api";

const ANIM_KEY = "gokai-animations-enabled";
const HEAVY_ANIM_KEY = "gokai-heavy-animations-enabled";

export function SettingsBootstrap() {
  const { setTheme } = useTheme();
  const { setFontSize, setJapaneseFont } = useTypography();
  const applied = useRef(false);

  useEffect(() => {
    if (applied.current) return;
    applied.current = true;

    getUserSettings()
      .then((settings) => {
        if (!settings) return;

        // ── Tema ───────────────────────────────────────────────
        setTheme(settings.appearance.darkMode ? "dark" : "light");

        // ── Tipografía ─────────────────────────────────────────
        setFontSize(normalizeFontSize(settings.appearance.fontSize));
        setJapaneseFont(normalizeJapaneseFont(settings.appearance.japaneseFont));
        setStoredAnswerConfirmationPreference(settings.general.confirmAnswers);
        setStoredAudioSpeed(settings.accessibility.audioSpeed);

        // ── Animaciones ────────────────────────────────────────
        const noAnim = settings.accessibility.reduceAnimations;
        try {
          localStorage.setItem(ANIM_KEY, String(!noAnim));
          localStorage.setItem(HEAVY_ANIM_KEY, String(!noAnim));
          window.dispatchEvent(new Event(ANIMATION_PREFERENCES_EVENT));
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
