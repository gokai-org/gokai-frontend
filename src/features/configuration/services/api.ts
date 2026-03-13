import { apiFetch } from "@/shared/lib/api/client";
import type {
  UserSettings,
  UserSettingsUpdate,
  SettingsApiResponse,
} from "@/features/configuration/types";

// ─── GET: obtener todas las configuraciones ──────────────────────

export async function getUserSettings(): Promise<UserSettings | null> {
  const res = await apiFetch<SettingsApiResponse>("/api/user/settings");
  return res.settings ?? null;
}

// ─── PATCH: actualizar una sección parcialmente ──────────────────

export async function updateSettingsSection<K extends keyof UserSettings>(
  section: K,
  data: Partial<UserSettings[K]>,
): Promise<UserSettings> {
  const res = await apiFetch<SettingsApiResponse>("/api/user/settings", {
    method: "PATCH",
    body: JSON.stringify({ section, data }),
  });
  return res.settings;
}

// ─── PUT: reemplazar todas las configuraciones ───────────────────

export async function replaceAllSettings(
  settings: UserSettings,
): Promise<UserSettings> {
  const res = await apiFetch<SettingsApiResponse>("/api/user/settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
  return res.settings;
}

// ─── Shortcuts por sección ───────────────────────────────────────

export const updateGeneralSettings = (data: Partial<UserSettings["general"]>) =>
  updateSettingsSection("general", data);

export const updateNotificationSettings = (
  data: Partial<UserSettings["notifications"]>,
) => updateSettingsSection("notifications", data);

export const updateAppearanceSettings = (
  data: Partial<UserSettings["appearance"]>,
) => updateSettingsSection("appearance", data);

export const updateLearningSettings = (
  data: Partial<UserSettings["learning"]>,
) => updateSettingsSection("learning", data);

export const updateAccessibilitySettings = (
  data: Partial<UserSettings["accessibility"]>,
) => updateSettingsSection("accessibility", data);

export const updatePrivacySettings = (data: Partial<UserSettings["privacy"]>) =>
  updateSettingsSection("privacy", data);
