// ─── User Settings Types ─────────────────────────────────────────

/** General settings */
export interface GeneralSettings {
  confirmAnswers: boolean;
  sessionDuration: string; // "15 min" | "30 min" | "45 min" | "60 min"
  breakReminders: boolean;
}

/** Notification settings */
export interface NotificationSettings {
  emailNotifications: boolean;
  notificationFrequency: string; // "Inmediato" | "Cada 3 horas" | "Diario" | "Semanal"
  priorityAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursDays: string; // "Todos los días" | "Lunes - Viernes" | "Fines de semana" | "Personalizado"
  quietHoursTime: string; // "21:00 - 07:00" | "22:00 - 08:00" | "23:00 - 09:00" | "Personalizado"
}

/** Appearance settings */
export interface AppearanceSettings {
  darkMode: boolean;
  fontSize: string; // "Pequeño" | "Mediano" | "Grande" | "Muy grande"
  japaneseFont: string; // "Noto Sans JP" | "Hiragino" | "Yu Gothic" | "Meiryo"
}

/** Learning preferences */
export interface LearningSettings {
  dailyGoal: string; // "15 minutos" | "30 minutos" | "45 minutos" | "60 minutos" | "90 minutos"
  dailyReviews: string; // "10 tarjetas" | "20 tarjetas" | "30 tarjetas" | "Ilimitado"
  notifyPendingReviews: boolean;
}

/** Accessibility settings */
export interface AccessibilitySettings {
  highContrast: boolean;
  reduceAnimations: boolean;
  audioSpeed: string; // "Muy lento" | "Lento" | "Normal" | "Rápido"
}

/** Privacy settings */
export interface PrivacySettings {
  usageDataCollection: boolean;
}

/** Full settings object – all sections combined */
export interface UserSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
  learning: LearningSettings;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
}

/** Partial update payload – any subset of settings */
export type UserSettingsUpdate = {
  [K in keyof UserSettings]?: Partial<UserSettings[K]>;
};

/** API response wrapper */
export interface SettingsApiResponse {
  settings: UserSettings;
}

// ─── Default values ──────────────────────────────────────────────

export const DEFAULT_SETTINGS: UserSettings = {
  general: {
    confirmAnswers: true,
    sessionDuration: "30 min",
    breakReminders: true,
  },
  notifications: {
    emailNotifications: true,
    notificationFrequency: "Diario",
    priorityAlerts: true,
    quietHoursEnabled: true,
    quietHoursDays: "Lunes - Viernes",
    quietHoursTime: "22:00 - 08:00",
  },
  appearance: {
    darkMode: false,
    fontSize: "Mediano",
    japaneseFont: "Noto Sans JP",
  },
  learning: {
    dailyGoal: "30 minutos",
    dailyReviews: "50 tarjetas",
    notifyPendingReviews: true,
  },
  accessibility: {
    highContrast: false,
    reduceAnimations: false,
    audioSpeed: "Normal",
  },
  privacy: {
    usageDataCollection: true,
  },
};
