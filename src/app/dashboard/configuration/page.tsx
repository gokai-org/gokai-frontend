"use client";

import { useState, useEffect } from "react";
import { SettingsSidebar } from "@/features/configuration/components/SettingsSidebar";
import { SettingsSection } from "@/features/configuration/components/SettingsSection";
import {
  SettingsSelectItem,
  SettingsToggleItem,
  SettingsToggleSelectItem,
} from "@/features/configuration/components/SettingsFields";
import { getCurrentUser } from "@/features/auth/services/api";
import type { User } from "@/features/auth/types";

import { useSettings } from "@/features/configuration/hooks/useSettings";
import type { UserSettings } from "@/features/configuration/types";
import { AccountSettings } from "@/features/configuration/components/AccountSettings";
import { useTheme } from "@/shared/hooks/useTheme";
import { useTypography } from "@/shared/hooks/useTypography";
import type { FontSize, JapaneseFont } from "@/shared/hooks/useTypography";

const sectionTitles: Record<string, string> = {
  general: "Configuración General",
  notifications: "Notificaciones",
  appearance: "Apariencia",
  learning: "Preferencias de Estudio",
  accessibility: "Accesibilidad",
  privacy: "Privacidad",
  account: "Cuenta",
};

type UpdateSectionFn = <K extends keyof UserSettings>(
  section: K,
  data: Partial<UserSettings[K]>,
) => void;

export default function ConfigurationPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const {
    settings,
    loading: settingsLoading,
    saving,
    error: settingsError,
    updateSection,
  } = useSettings();
  const { setTheme } = useTheme();

  useEffect(() => {
    async function loadUser() {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    loadUser();
  }, []);

  // Sync theme from backend settings when they load
  useEffect(() => {
    if (!settingsLoading) {
      setTheme(settings.appearance.darkMode ? "dark" : "light");
    }
  }, [settingsLoading, settings.appearance.darkMode, setTheme]);

  return (
    <div className="flex flex-col sm:flex-row h-full bg-surface-primary">
      <SettingsSidebar
        activeItem={activeSection}
        onItemChange={setActiveSection}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-content-primary">
                  {sectionTitles[activeSection] || "Configuración"}
                </h1>
                <p className="mt-2 text-xs md:text-sm text-content-secondary">
                  Personaliza tu experiencia de aprendizaje de japonés
                </p>
              </div>
              {saving && (
                <span className="text-xs text-content-muted animate-pulse">
                  Guardando...
                </span>
              )}
              {settingsError && (
                <span className="text-xs text-red-500">{settingsError}</span>
              )}
            </div>
          </div>

          {settingsLoading && activeSection !== "account" ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-content-tertiary">
                Cargando configuración...
              </div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {activeSection === "general" && (
                <GeneralSettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "notifications" && (
                <NotificationSettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "appearance" && (
                <AppearanceSettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "learning" && (
                <LearningSettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "accessibility" && (
                <AccessibilitySettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "privacy" && (
                <PrivacySettings
                  settings={settings}
                  updateSection={updateSection}
                />
              )}
              {activeSection === "account" && (
                <AccountSettings
                  user={user}
                  setUser={setUser}
                  loading={loading}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GeneralSettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const g = settings.general;
  return (
    <>
      <SettingsSection
        title="Preferencias Generales"
        description="Configura los ajustes básicos de la plataforma"
      >
        <SettingsToggleItem
          label="Confirmación de respuestas"
          description="Requiere confirmación antes de enviar respuestas"
          enabled={g.confirmAnswers}
          onChange={(v) => updateSection("general", { confirmAnswers: v })}
        />
      </SettingsSection>

      <SettingsSection
        title="Sesiones de Estudio"
        description="Personaliza tus sesiones de práctica"
      >
        <SettingsSelectItem
          label="Duración de sesión"
          description="Tiempo predeterminado para sesiones de estudio"
          value={g.sessionDuration}
          options={["15 min", "30 min", "45 min", "60 min"]}
          onChange={(v) => updateSection("general", { sessionDuration: v })}
        />

        <SettingsToggleItem
          label="Recordatorios de descanso"
          description="Te avisaremos cuando sea momento de descansar"
          enabled={g.breakReminders}
          onChange={(v) => updateSection("general", { breakReminders: v })}
        />
      </SettingsSection>
    </>
  );
}

function NotificationSettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const n = settings.notifications;
  return (
    <>
      <SettingsSection
        title="Notificaciones por Email"
        description="Recibe actualizaciones importantes por correo electrónico"
      >
        <SettingsToggleSelectItem
          label="Frecuencia de notificaciones"
          description="Con qué frecuencia quieres recibir notificaciones agrupadas"
          toggleEnabled={n.emailNotifications}
          onToggleChange={(v) =>
            updateSection("notifications", { emailNotifications: v })
          }
          value={n.notificationFrequency}
          options={["Inmediato", "Cada 3 horas", "Diario", "Semanal"]}
          onChange={(v) =>
            updateSection("notifications", { notificationFrequency: v })
          }
        />

        <SettingsToggleItem
          label="Alertas prioritarias"
          description="Notificaciones críticas que te pueden interrumpir"
          enabled={n.priorityAlerts}
          onChange={(v) =>
            updateSection("notifications", { priorityAlerts: v })
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Horarios Silenciosos"
        description="No recibirás notificaciones durante tus horas de descanso"
      >
        <SettingsToggleItem
          label="Activar horario silencioso"
          description="Define cuándo no quieres ser interrumpido"
          enabled={n.quietHoursEnabled}
          onChange={(v) =>
            updateSection("notifications", { quietHoursEnabled: v })
          }
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsSelectItem
            label="Días de la semana"
            value={n.quietHoursDays}
            options={[
              "Todos los días",
              "Lunes - Viernes",
              "Fines de semana",
              "Personalizado",
            ]}
            onChange={(v) =>
              updateSection("notifications", { quietHoursDays: v })
            }
          />
          <SettingsSelectItem
            label="Horario"
            value={n.quietHoursTime}
            options={[
              "21:00 - 07:00",
              "22:00 - 08:00",
              "23:00 - 09:00",
              "Personalizado",
            ]}
            onChange={(v) =>
              updateSection("notifications", { quietHoursTime: v })
            }
          />
        </div>
      </SettingsSection>
    </>
  );
}

function AppearanceSettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const a = settings.appearance;
  const { setTheme } = useTheme();
  const { setFontSize, setJapaneseFont } = useTypography();
  return (
    <>
      <SettingsSection
        title="Tema Visual"
        description="Personaliza la apariencia de la interfaz"
      >
        <SettingsToggleItem
          label="Modo oscuro"
          description="Activa el tema oscuro para reducir la fatiga visual"
          enabled={a.darkMode}
          onChange={(v) => {
            updateSection("appearance", { darkMode: v });
            setTheme(v ? "dark" : "light");
          }}
        />
      </SettingsSection>

      <SettingsSection
        title="Tipografía"
        description="Ajusta el tamaño y estilo del texto"
      >
        <SettingsSelectItem
          label="Tamaño de fuente"
          description="Tamaño del texto en la interfaz"
          value={a.fontSize}
          options={["Pequeño", "Mediano", "Grande", "Muy grande"]}
          onChange={(v) => {
            updateSection("appearance", { fontSize: v });
            setFontSize(v as FontSize);
          }}
        />

        <SettingsSelectItem
          label="Fuente para japonés"
          description="Tipografía para caracteres japoneses"
          value={a.japaneseFont}
          options={["Noto Sans JP", "Hiragino", "Yu Gothic", "Meiryo"]}
          onChange={(v) => {
            updateSection("appearance", { japaneseFont: v });
            setJapaneseFont(v as JapaneseFont);
          }}
        />
      </SettingsSection>
    </>
  );
}

function LearningSettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const l = settings.learning;
  return (
    <>
      <SettingsSection
        title="Nivel y Objetivos"
        description="Define tu nivel actual y metas de aprendizaje"
      >
        <SettingsSelectItem
          label="Meta diaria"
          description="Tiempo de estudio diario que deseas alcanzar"
          value={l.dailyGoal}
          options={[
            "15 minutos",
            "30 minutos",
            "45 minutos",
            "60 minutos",
            "90 minutos",
          ]}
          onChange={(v) => updateSection("learning", { dailyGoal: v })}
        />
      </SettingsSection>

      <SettingsSection
        title="Sistema de Repaso"
        description="Configura el sistema de repetición espaciada"
      >
        <SettingsSelectItem
          label="Repasos diarios"
          description="Cantidad máxima de repasos por día"
          value={l.dailyReviews}
          options={["10 tarjetas", "20 tarjetas", "30 tarjetas", "Ilimitado"]}
          onChange={(v) => updateSection("learning", { dailyReviews: v })}
        />

        <SettingsToggleItem
          label="Notificar repasos pendientes"
          description="Recibir recordatorios de contenido por repasar"
          enabled={l.notifyPendingReviews}
          onChange={(v) =>
            updateSection("learning", { notifyPendingReviews: v })
          }
        />
      </SettingsSection>
    </>
  );
}

function AccessibilitySettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const ac = settings.accessibility;
  return (
    <>
      <SettingsSection
        title="Ayudas Visuales"
        description="Mejora la legibilidad y navegación"
      >
        <SettingsToggleItem
          label="Alto contraste"
          description="Aumenta el contraste para mejor legibilidad"
          enabled={ac.highContrast}
          onChange={(v) => {
            updateSection("accessibility", { highContrast: v });
            document.documentElement.classList.toggle("high-contrast", v);
          }}
        />

        <SettingsToggleItem
          label="Reducir animaciones"
          description="Minimiza animaciones y transiciones"
          enabled={ac.reduceAnimations}
          onChange={(v) => {
            updateSection("accessibility", { reduceAnimations: v });
            try {
              localStorage.setItem("gokai-animations-enabled", String(!v));
              localStorage.setItem("gokai-heavy-animations-enabled", String(!v));
            } catch {}
          }}
        />
      </SettingsSection>

      <SettingsSection
        title="Audio y Voz"
        description="Configuración de audio y lectura de pantalla"
      >
        <SettingsSelectItem
          label="Velocidad de audio"
          description="Velocidad de reproducción del audio japonés"
          value={ac.audioSpeed}
          options={["Muy lento", "Lento", "Normal", "Rápido"]}
          onChange={(v) => updateSection("accessibility", { audioSpeed: v })}
        />
      </SettingsSection>
    </>
  );
}

function PrivacySettings({
  settings,
  updateSection,
}: {
  settings: UserSettings;
  updateSection: UpdateSectionFn;
}) {
  const p = settings.privacy;
  return (
    <>
      <SettingsSection
        title="Datos y Privacidad"
        description="Controla tu información personal"
      >
        <SettingsToggleItem
          label="Recopilación de datos de uso"
          description="Ayúdanos a mejorar compartiendo datos anónimos"
          enabled={p.usageDataCollection}
          onChange={(v) => updateSection("privacy", { usageDataCollection: v })}
        />
      </SettingsSection>
    </>
  );
}
