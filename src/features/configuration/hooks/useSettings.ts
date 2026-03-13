"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UserSettings } from "@/features/configuration/types";
import { DEFAULT_SETTINGS } from "@/features/configuration/types";
import {
  getUserSettings,
  updateSettingsSection,
} from "@/features/configuration/services/api";

interface UseSettingsReturn {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
  /** Actualiza uno o varios campos de una sección y persiste en backend. */
  updateSection: <K extends keyof UserSettings>(
    section: K,
    data: Partial<UserSettings[K]>,
  ) => void;
  /** Fuerza una recarga desde el servidor. */
  refresh: () => Promise<void>;
  /** Indica si hay un guardado en progreso. */
  saving: boolean;
}

/**
 * Hook que gestiona el estado completo de configuración del usuario.
 *
 * Carga settings del backend al montar.
 * Aplica cambios locales de forma optimista.
 * Hace debounce de 600ms antes de persistir en backend para evitar spam.
 * Revierte a estado anterior si falla el guardado.
 */
export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Guardamos la versión previa para rollback en caso de error
  const prevRef = useRef<UserSettings>(DEFAULT_SETTINGS);
  // Timers de debounce por sección
  const timers = useRef<
    Partial<Record<keyof UserSettings, ReturnType<typeof setTimeout>>>
  >({});

  // ── Carga inicial ──────────────────────────────────────────────
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const remote = await getUserSettings();
      if (remote) {
        // Merge con defaults para cubrir campos nuevos que aún no existan en BD
        const merged = mergeWithDefaults(remote);
        setSettings(merged);
        prevRef.current = merged;
      }
    } catch (err) {
      console.error("Error al cargar configuración:", err);
      setError("No se pudo cargar la configuración");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    // Limpiar timers al desmontar
    return () => {
      Object.values(timers.current).forEach((t) => t && clearTimeout(t));
    };
  }, [fetchSettings]);

  // ── Actualización optimista con debounce ───────────────────────
  const updateSection = useCallback(
    <K extends keyof UserSettings>(
      section: K,
      data: Partial<UserSettings[K]>,
    ) => {
      // Actualización local inmediata (optimistic)
      setSettings((prev) => {
        const next = {
          ...prev,
          [section]: { ...prev[section], ...data },
        };
        return next;
      });

      // Debounce para persistir
      if (timers.current[section]) {
        clearTimeout(timers.current[section]);
      }

      timers.current[section] = setTimeout(async () => {
        try {
          setSaving(true);
          setError(null);
          const updated = await updateSettingsSection(section, data);
          // Backend nos devuelve el estado actualizado
          const merged = mergeWithDefaults(updated);
          setSettings(merged);
          prevRef.current = merged;
        } catch (err) {
          console.error(`Error al guardar sección "${section}":`, err);
          setError("Error al guardar los cambios");
          // Rollback
          setSettings(prevRef.current);
        } finally {
          setSaving(false);
        }
      }, 600);
    },
    [],
  );

  return {
    settings,
    loading,
    error,
    updateSection,
    refresh: fetchSettings,
    saving,
  };
}

// ─── Utilidades ──────────────────────────────────────────────────

/** Fusiona settings remotos con defaults para rellenar campos faltantes. */
function mergeWithDefaults(remote: UserSettings): UserSettings {
  return {
    general: { ...DEFAULT_SETTINGS.general, ...remote.general },
    notifications: {
      ...DEFAULT_SETTINGS.notifications,
      ...remote.notifications,
    },
    appearance: { ...DEFAULT_SETTINGS.appearance, ...remote.appearance },
    learning: { ...DEFAULT_SETTINGS.learning, ...remote.learning },
    accessibility: {
      ...DEFAULT_SETTINGS.accessibility,
      ...remote.accessibility,
    },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...remote.privacy },
  };
}
