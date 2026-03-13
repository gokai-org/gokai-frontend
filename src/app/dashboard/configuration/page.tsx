"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion } from "framer-motion";
import { SettingsSidebar } from "@/features/configuration/components/SettingsSidebar";
import { SettingsSection } from "@/features/configuration/components/SettingsSection";
import { SettingsItem } from "@/features/configuration/components/SettingsItem";
import { SettingsSelectItem, SettingsToggleItem, SettingsToggleSelectItem } from "@/features/configuration/components/SettingsFields";
import { IntegrationButton } from "@/features/configuration/components/IntegrationButton";
import { getCurrentUser } from "@/features/auth/services/api";
import type { User } from "@/features/auth/types";
import { useToast } from "@/shared/ui/ToastProvider";
import { useSettings } from "@/features/configuration/hooks/useSettings";
import type { UserSettings } from "@/features/configuration/types";
import { UpgradePlanModal } from "@/features/configuration/components/UpgradePlanModal";
import { CancelSubscriptionModal } from "@/features/configuration/components/CancelSubscriptionModal";

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
  const { settings, loading: settingsLoading, saving, error: settingsError, updateSection } = useSettings();

  useEffect(() => {
    async function loadUser() {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    }
    loadUser();
  }, []);

  return (
    <div className="flex h-full bg-white">
      <SettingsSidebar activeItem={activeSection} onItemChange={setActiveSection} />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-8">
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {sectionTitles[activeSection] || "Configuración"}
                </h1>
                <p className="mt-2 text-xs md:text-sm text-gray-600">
                  Personaliza tu experiencia de aprendizaje de japonés
                </p>
              </div>
              {saving && (
                <span className="text-xs text-gray-400 animate-pulse">Guardando...</span>
              )}
              {settingsError && (
                <span className="text-xs text-red-500">{settingsError}</span>
              )}
            </div>
          </div>

          {settingsLoading && activeSection !== "account" ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Cargando configuración...</div>
            </div>
          ) : (
            <div className="space-y-6 md:space-y-8">
              {activeSection === "general" && <GeneralSettings settings={settings} updateSection={updateSection} />}
              {activeSection === "notifications" && <NotificationSettings settings={settings} updateSection={updateSection} />}
              {activeSection === "appearance" && <AppearanceSettings settings={settings} updateSection={updateSection} />}
              {activeSection === "learning" && <LearningSettings settings={settings} updateSection={updateSection} />}
              {activeSection === "accessibility" && <AccessibilitySettings settings={settings} updateSection={updateSection} />}
              {activeSection === "privacy" && <PrivacySettings settings={settings} updateSection={updateSection} />}
              {activeSection === "account" && <AccountSettings user={user} setUser={setUser} loading={loading} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function GeneralSettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
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

function NotificationSettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
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
          onToggleChange={(v) => updateSection("notifications", { emailNotifications: v })}
          value={n.notificationFrequency}
          options={["Inmediato", "Cada 3 horas", "Diario", "Semanal"]}
          onChange={(v) => updateSection("notifications", { notificationFrequency: v })}
        />

        <SettingsToggleItem
          label="Alertas prioritarias"
          description="Notificaciones críticas que te pueden interrumpir"
          enabled={n.priorityAlerts}
          onChange={(v) => updateSection("notifications", { priorityAlerts: v })}
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
          onChange={(v) => updateSection("notifications", { quietHoursEnabled: v })}
        />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SettingsSelectItem
            label="Días de la semana"
            value={n.quietHoursDays}
            options={["Todos los días", "Lunes - Viernes", "Fines de semana", "Personalizado"]}
            onChange={(v) => updateSection("notifications", { quietHoursDays: v })}
          />
          <SettingsSelectItem
            label="Horario"
            value={n.quietHoursTime}
            options={["21:00 - 07:00", "22:00 - 08:00", "23:00 - 09:00", "Personalizado"]}
            onChange={(v) => updateSection("notifications", { quietHoursTime: v })}
          />
        </div>
      </SettingsSection>
    </>
  );
}

function AppearanceSettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
  const a = settings.appearance;
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
          onChange={(v) => updateSection("appearance", { darkMode: v })}
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
          onChange={(v) => updateSection("appearance", { fontSize: v })}
        />

        <SettingsSelectItem
          label="Fuente para japonés"
          description="Tipografía para caracteres japoneses"
          value={a.japaneseFont}
          options={["Noto Sans JP", "Hiragino", "Yu Gothic", "Meiryo"]}
          onChange={(v) => updateSection("appearance", { japaneseFont: v })}
        />
      </SettingsSection>
    </>
  );
}

function LearningSettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
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
          options={["15 minutos", "30 minutos", "45 minutos", "60 minutos", "90 minutos"]}
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
          onChange={(v) => updateSection("learning", { notifyPendingReviews: v })}
        />
      </SettingsSection>
    </>
  );
}

function AccessibilitySettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
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
          onChange={(v) => updateSection("accessibility", { reduceAnimations: v })}
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

function PrivacySettings({ settings, updateSection }: { settings: UserSettings; updateSection: UpdateSectionFn }) {
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

function AccountSettings({ user, setUser, loading }: { user: User | null; setUser: (user: User | null) => void; loading: boolean }) {
  const toast = useToast();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Estados para edición de perfil
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    birthdate: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Estado para la suscripción
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  // Estados para modales de upgrade y cancelación
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
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()).toLocaleDateString("es-ES", {
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

  // Cargar detalles de suscripción si el usuario está suscrito
  useEffect(() => {
    if (user && user.id) {
      const loadSubscription = async () => {
        setSubscriptionLoading(true);
        try {
          const response = await fetch(`/api/subscription/${user.id}`);
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
    } catch (error) {
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
        <div className="text-gray-500 animate-pulse">Cargando tu información...</div>
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

  const subscriptionStartDate = parseDate(subscription?.created_at ?? subscription?.start_date);
  const subscriptionEndDate = parseDate(
    subscription?.current_period_end
      ?? subscription?.expires_at
      ?? subscription?.expiry_date
      ?? subscription?.vigency,
  );
  const hasRecurringPayment = subscription?.has_recurring_payment !== false;
  const hasActiveWindow = !!(subscriptionEndDate && subscriptionEndDate > new Date());

  const isSubscriptionActive = !!(
    (user?.subscribed && subscription?.status === "active")
    || (subscription?.status === "active")
    || (user?.subscribed && hasActiveWindow)
  );
  const isCouponBasedSubscription = isSubscriptionActive && !hasRecurringPayment;
  const userPlanLabel = isSubscriptionActive ? "Plan GOKAI+" : (user?.plan ? planNames[user.plan] : "Plan Gratuito");
  const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID ?? process.env.SUBSCRIPTION_PRICE_ID;

  const refreshUserAndSubscription = async () => {
    const updatedUser = await getCurrentUser();
    if (!updatedUser) return;

    setUser(updatedUser);
    const subRes = await fetch(`/api/subscription/${updatedUser.id}`);
    if (subRes.ok) {
      const subData = await subRes.json();
      setSubscription(subData);
    }
  };

  const claimCoupon = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/subscription/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.success === false) {
        return { success: false, error: data.error || "No se pudo aplicar el cupón" };
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
    toast.success("Cupón aplicado correctamente. Tu suscripción ya está activa.");
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
      toast.success("Cupón aplicado correctamente. Tu suscripción ya está activa.");
      return;
    }

    if (!STRIPE_PRICE_ID) {
      setStripeError("Error de configuración: falta el priceId de Stripe");
      setStripeLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId: STRIPE_PRICE_ID, successUrl: window.location.href }),
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
      // Refrescar datos del usuario y suscripción
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
          className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm"
        >
          <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#993331] to-[#BA5149] flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 text-center sm:text-left mt-2 sm:mt-0">
              <h3 className="text-lg font-semibold text-gray-900">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Tu cuenta"}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-3 inline-flex items-center rounded-full bg-[#993331]/10 px-3 py-1 text-xs font-medium text-[#993331]">
                {user?.createdAt ? `Miembro desde ${formatDateEs(user.createdAt)}` : "Perfil activo"}
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="mt-4 sm:mt-0 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm focus:ring-2 focus:ring-[#993331] focus:outline-none"
              >
                Editar Perfil
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#993331] focus:border-[#993331] outline-none transition-all"
                    placeholder="Tu nombre"
                    autoFocus
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.firstName || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#993331] focus:border-[#993331] outline-none transition-all"
                    placeholder="Tu apellido"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.lastName || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Correo electrónico
                  {isEditingProfile && <span className="text-xs text-gray-400 font-normal">(No editable)</span>}
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{user?.email || "—"}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  Fecha de nacimiento
                  {isEditingProfile && <span className="text-xs text-gray-400 font-normal">(No editable)</span>}
                </label>
                {isEditingProfile ? (
                  <input
                    type="date"
                    value={profileData.birthdate}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                ) : (
                  <p className="text-gray-900 py-2">{formatBirthdateForDisplay(user?.birthdate)}</p>
                )}
              </div>
            </div>

            {isEditingProfile && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100"
              >
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#993331] rounded-lg hover:bg-[#802a28] shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
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
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                {userPlanLabel}
                {isSubscriptionActive && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                )}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {isCouponBasedSubscription ? "Suscripción activa mediante cupón promocional." : "Obtén acceso total a todas las herramientas de estudio."}
              </p>
            </div>

            {!isSubscriptionActive && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#993331] to-[#BA5149] rounded-lg hover:shadow-md transition-all whitespace-nowrap"
              >
                Mejorar Plan
              </button>
            )}
          </div>

          {(isSubscriptionActive || hasActiveWindow || subscriptionLoading) && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs text-gray-500 mb-1">Fecha de inicio</span>
                <span className="text-sm font-medium text-gray-900">
                  {subscriptionLoading ? "Cargando..." : formatDateEs(subscriptionStartDate)}
                </span>
              </div>
              <div>
                <span className="block text-xs text-gray-500 mb-1">{isCouponBasedSubscription ? "Expira el" : "Próxima renovación"}</span>
                <span className="text-sm font-medium text-gray-900">
                  {subscriptionLoading ? "Cargando..." : formatDateEs(subscriptionEndDate)}
                </span>
              </div>
            </div>
          )}

          {isSubscriptionActive && hasRecurringPayment && (
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setShowCancelModal(true)}
                className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
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
          <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
            <div>
              <p className="font-medium text-gray-900">Contraseña</p>
              <p className="text-sm text-gray-500">Mantén tu cuenta segura actualizando tu contraseña regularmente.</p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cambiar
            </button>
          </div>

          <div className="p-5 mt-8 border border-red-200 bg-red-50/50 rounded-xl">
            <h4 className="text-base font-semibold text-red-700">Zona de peligro</h4>
            <p className="text-sm text-red-600/80 mt-1 mb-4">
              Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, asegúrate de estar seguro.
            </p>

            {showDeleteConfirm ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sí, eliminar mi cuenta definitivamente
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
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
