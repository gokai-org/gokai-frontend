"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SettingsSidebar } from "@/features/configuration/components/SettingsSidebar";
import { SettingsSection } from "@/features/configuration/components/SettingsSection";
import {
  SettingsSelectItem,
  SettingsToggleItem,
  SettingsToggleSelectItem,
} from "@/features/configuration/components/SettingsFields";
import { getCurrentUser } from "@/features/auth/services/api";
import type { User } from "@/features/auth/types";
import { useToast } from "@/shared/ui/ToastProvider";
import { useSettings } from "@/features/configuration/hooks/useSettings";
import type { UserSettings } from "@/features/configuration/types";
import { UpgradePlanModal } from "@/features/configuration/components/UpgradePlanModal";
import { CancelSubscriptionModal } from "@/features/configuration/components/CancelSubscriptionModal";
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
    <div className="flex h-full bg-surface-primary">
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
          onChange={(v) => updateSection("accessibility", { highContrast: v })}
        />

        <SettingsToggleItem
          label="Reducir animaciones"
          description="Minimiza animaciones y transiciones"
          enabled={ac.reduceAnimations}
          onChange={(v) =>
            updateSection("accessibility", { reduceAnimations: v })
          }
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

function AccountSettings({
  user,
  setUser,
  loading,
}: {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}) {
  const toast = useToast();
  const [, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    birthdate: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const formatBirthdateForInput = (birthdate?: string | Date | null) => {
    if (!birthdate) return "";
    const date = new Date(birthdate);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatBirthdateForDisplay = (birthdate?: string | Date | null) => {
    if (!birthdate) return "No especificado";
    const date = new Date(birthdate);
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
    ).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        birthdate: formatBirthdateForInput(user.birthdate),
      });
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      const loadSubscription = async () => {
        setSubscriptionLoading(true);
        try {
          const response = await fetch("/api/subscription/me");
          if (response.ok) {
            const data = await response.json();
            setSubscription(data);
          }
        } catch (error) {
          console.error("Error loading subscription:", error);
        } finally {
          setSubscriptionLoading(false);
        }
      };
      loadSubscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleSaveProfile = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const updateData = {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
      };

      const response = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const data = await response.json();

        if (data.user) {
          setUser(data.user);

          setProfileData({
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            email: data.user.email || "",
            birthdate: formatBirthdateForInput(data.user.birthdate),
          });

          setIsEditingProfile(false);
          toast.success("Perfil actualizado correctamente");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al guardar los cambios");
      }
    } catch {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);

    setProfileData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      birthdate: formatBirthdateForInput(user?.birthdate),
    });
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await fetch("/api/auth/user", { method: "DELETE" });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Error al eliminar cuenta");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-content-tertiary animate-pulse">
          Cargando tu información...
        </div>
      </div>
    );
  }

  const planNames = {
    free: "Plan Gratuito",
    premium: "Plan Premium",
    pro: "Plan Pro",
  };

  const parseDate = (value: unknown): Date | null => {
    if (!value) return null;
    const parsed = new Date(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const formatDateEs = (value: unknown): string => {
    const parsed = parseDate(value);
    if (!parsed) return "No disponible";
    return parsed.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const subscriptionStartDate = parseDate(
    subscription?.created_at ?? subscription?.start_date,
  );
  const subscriptionEndDate = parseDate(
    subscription?.current_period_end ??
      subscription?.expires_at ??
      subscription?.expiry_date ??
      subscription?.vigency,
  );
  const hasRecurringPayment = subscription?.has_recurring_payment !== false;
  const hasActiveWindow = !!(
    subscriptionEndDate && subscriptionEndDate > new Date()
  );

  const isSubscriptionActive = !!(
    (user?.subscribed && subscription?.status === "active") ||
    subscription?.status === "active" ||
    (user?.subscribed && hasActiveWindow)
  );
  const isCouponBasedSubscription =
    isSubscriptionActive && !hasRecurringPayment;
  const userPlanLabel = isSubscriptionActive
    ? "Plan GOKAI+"
    : user?.plan
      ? planNames[user.plan]
      : "Plan Gratuito";

  const refreshUserAndSubscription = async () => {
    const updatedUser = await getCurrentUser();
    if (!updatedUser) return;

    setUser(updatedUser);
    const subRes = await fetch("/api/subscription/me");
    if (subRes.ok) {
      const subData = await subRes.json();
      setSubscription(subData);
    }
  };

  const claimCoupon = async (
    code: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/subscription/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        return {
          success: false,
          error: data.error || "No se pudo aplicar el cupón",
        };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Error de red" };
    }
  };

  const handleApplyCoupon = async () => {
    const code = coupon.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    setStripeError(null);

    const result = await claimCoupon(code);
    if (!result.success) {
      setCouponError(result.error || "No se pudo aplicar el cupón");
      setCouponLoading(false);
      return;
    }

    await refreshUserAndSubscription();
    setCoupon("");
    setShowUpgradeModal(false);
    setCouponLoading(false);
    toast.success(
      "Cupón aplicado correctamente. Tu suscripción ya está activa.",
    );
  };

  const handleStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);

    const couponCode = coupon.trim();
    if (couponCode) {
      const result = await claimCoupon(couponCode);
      if (!result.success) {
        setCouponError(result.error || "No se pudo aplicar el cupón");
        setStripeLoading(false);
        return;
      }

      await refreshUserAndSubscription();
      setCoupon("");
      setShowUpgradeModal(false);
      setStripeLoading(false);
      toast.success(
        "Cupón aplicado correctamente. Tu suscripción ya está activa.",
      );
      return;
    }

    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          successUrl: window.location.href,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      setStripeError(data.error || "Error al iniciar pago");
    } catch {
      setStripeError("Error de red");
    } finally {
      setStripeLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/subscription/${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        setCancelError(data.error || "Error al cancelar la suscripción");
        return;
      }

      toast.success("Suscripción cancelada correctamente");
      setShowCancelModal(false);
      await refreshUserAndSubscription();
    } catch {
      setCancelError("Error de red al cancelar la suscripción");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleStripe}
        loading={stripeLoading}
        error={stripeError}
        coupon={coupon}
        onCouponChange={(value) => {
          setCoupon(value);
          if (couponError) setCouponError(null);
        }}
        onApplyCoupon={handleApplyCoupon}
        couponLoading={couponLoading}
        couponError={couponError}
      />

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelError(null);
        }}
        onConfirmCancel={handleCancelSubscription}
        loading={cancelLoading}
        error={cancelError}
      />

      <SettingsSection
        title="Información Personal"
        description="Visualiza y actualiza tu información de contacto"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border-default bg-surface-elevated overflow-hidden shadow-sm"
        >
          <div className="bg-gradient-to-r from-surface-secondary to-surface-primary p-6 border-b border-border-subtle flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-content-inverted text-3xl font-bold shadow-md">
              {user?.firstName?.charAt(0).toUpperCase() ||
                user?.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <h3 className="text-lg font-semibold text-content-primary">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName || ""}`
                  : "Tu cuenta"}
              </h3>
              <p className="text-sm text-content-tertiary">{user?.email}</p>
              <div className="mt-3 inline-flex items-center rounded-full bg-accent-subtle px-3 py-1 text-xs font-medium text-accent">
                {user?.createdAt
                  ? `Miembro desde ${formatDateEs(user.createdAt)}`
                  : "Perfil activo"}
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-content-secondary bg-surface-primary border border-border-default rounded-lg hover:bg-surface-secondary transition-colors shadow-sm focus:ring-2 focus:ring-accent focus:outline-none"
              >
                Editar Perfil
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">
                  Nombre
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    placeholder="Tu nombre"
                    autoFocus
                  />
                ) : (
                  <p className="text-content-primary py-2">
                    {user?.firstName || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1">
                  Apellido
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-border-default rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none transition-all"
                    placeholder="Tu apellido"
                  />
                ) : (
                  <p className="text-content-primary py-2">
                    {user?.lastName || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1 flex items-center gap-2">
                  Correo electrónico
                  {isEditingProfile && (
                    <span className="text-xs text-content-muted font-normal">
                      (No editable)
                    </span>
                  )}
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-border-default rounded-lg bg-surface-secondary text-content-tertiary cursor-not-allowed"
                  />
                ) : (
                  <p className="text-content-primary py-2">
                    {user?.email || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-content-secondary mb-1 flex items-center gap-2">
                  Fecha de nacimiento
                  {isEditingProfile && (
                    <span className="text-xs text-content-muted font-normal">
                      (No editable)
                    </span>
                  )}
                </label>
                {isEditingProfile ? (
                  <input
                    type="date"
                    value={profileData.birthdate}
                    disabled
                    className="w-full px-4 py-2 border border-border-default rounded-lg bg-surface-secondary text-content-tertiary cursor-not-allowed"
                  />
                ) : (
                  <p className="text-content-primary py-2">
                    {formatBirthdateForDisplay(user?.birthdate)}
                  </p>
                )}
              </div>
            </div>

            {isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-border-subtle"
              >
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-content-secondary bg-surface-primary hover:bg-surface-secondary rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-content-inverted bg-accent rounded-lg hover:bg-accent-hover shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-content-inverted/30 border-t-content-inverted rounded-full animate-spin"></span>
                      Guardando...
                    </>
                  ) : (
                    "Guardar cambios"
                  )}
                </button>
              </motion.div>
            )}
          </form>
        </motion.div>
      </SettingsSection>

      <SettingsSection
        title="Suscripción y Facturación"
        description="Administra tu plan actual y beneficios"
      >
        <div className="bg-surface-elevated rounded-2xl border border-border-default p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-content-primary flex items-center gap-2">
                {userPlanLabel}
                {isSubscriptionActive && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-success-subtle text-status-success">
                    Activo
                  </span>
                )}
              </h4>
              <p className="text-sm text-content-tertiary mt-1">
                {isCouponBasedSubscription
                  ? "Suscripción activa mediante cupón promocional."
                  : "Obtén acceso total a todas las herramientas de estudio."}
              </p>
            </div>

            {!isSubscriptionActive && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2.5 text-sm font-medium text-content-inverted bg-gradient-to-r from-accent to-accent-hover rounded-lg hover:shadow-md transition-all whitespace-nowrap"
              >
                Mejorar Plan
              </button>
            )}
          </div>

          {(isSubscriptionActive || hasActiveWindow || subscriptionLoading) && (
            <div className="bg-surface-secondary rounded-xl p-4 border border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-content-tertiary mb-1">
                  Fecha de inicio
                </span>
                <span className="text-sm font-medium text-content-primary">
                  {subscriptionLoading
                    ? "Cargando..."
                    : formatDateEs(subscriptionStartDate)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-content-tertiary mb-1">
                  {isCouponBasedSubscription
                    ? "Expira el"
                    : "Próxima renovación"}
                </span>
                <span className="text-sm font-medium text-content-primary">
                  {subscriptionLoading
                    ? "Cargando..."
                    : formatDateEs(subscriptionEndDate)}
                </span>
              </div>
            </div>
          )}

          {isSubscriptionActive && hasRecurringPayment && (
            <div className="mt-6 pt-6 border-t border-border-subtle flex justify-end">
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm font-medium text-content-tertiary hover:text-status-error transition-colors"
              >
                Cancelar mi suscripción
              </button>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Seguridad de la Cuenta"
        description="Actualiza tus credenciales o elimina tu cuenta definitivamente."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-surface-elevated border border-border-default rounded-xl shadow-sm">
            <div>
              <p className="font-medium text-content-primary">Contraseña</p>
              <p className="text-sm text-content-tertiary">
                Mantén tu cuenta segura actualizando tu contraseña regularmente.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm font-medium text-content-secondary bg-surface-primary border border-border-default rounded-lg hover:bg-surface-secondary transition-colors"
            >
              Cambiar
            </button>
          </div>

          <div className="p-5 mt-8 border border-status-error/20 bg-status-error-subtle rounded-xl">
            <h4 className="text-base font-semibold text-status-error">
              Zona de peligro
            </h4>
            <p className="text-sm text-status-error/80 mt-1 mb-4">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor,
              asegúrate de estar seguro.
            </p>

            {showDeleteConfirm ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-content-inverted bg-status-error rounded-lg hover:bg-status-error/90 transition-colors"
                >
                  Sí, eliminar mi cuenta definitivamente
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-content-secondary bg-surface-primary border border-border-default rounded-lg hover:bg-surface-secondary transition-colors"
                >
                  Cancelar
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-status-error bg-surface-primary border border-status-error/20 rounded-lg hover:bg-status-error-subtle hover:border-status-error/30 transition-colors"
              >
                Eliminar cuenta
              </button>
            )}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
