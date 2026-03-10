"use client";

import { useState, useEffect } from "react";
import { SettingsSidebar } from "@/features/configuration/components/SettingsSidebar";
import { SettingsSection } from "@/features/configuration/components/SettingsSection";
import { SettingsItem } from "@/features/configuration/components/SettingsItem";
import { SettingsSelectItem, SettingsToggleItem, SettingsToggleSelectItem } from "@/features/configuration/components/SettingsFields";
import { Toggle } from "@/shared/ui/Toggle";
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

        <div className="grid grid-cols-2 gap-4">
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
  const [showEmailModal, setShowEmailModal] = useState(false);
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
          } else {
            console.error("Error loading subscription:", response.statusText);
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

  const handleSaveProfile = async () => {
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
        } else {
          toast.error("No se recibieron datos del usuario");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Error al guardar los cambios");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
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

  const handleToggle2FA = async (enabled: boolean) => {
    try {
      await fetch("/api/auth/user/2fa", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      });
    } catch (error) {
      console.error("Error toggling 2FA:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Cargando información...</div>
      </div>
    );
  }

  const planNames = {
    free: "Plan Gratuito",
    premium: "Plan Premium",
    pro: "Plan Pro",
  };

  const isSubscriptionActive = user?.subscribed && subscription?.status === "active";
  const userPlanLabel = isSubscriptionActive ? "Plan GOKAI+" : (user?.plan ? planNames[user.plan] : "Plan Gratuito");

  const STRIPE_PRICE_ID = process.env.SUBSCRIPTION_PRICE_ID;

  const handleStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
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
      const updatedUser = await getCurrentUser();
      if (updatedUser) setUser(updatedUser);
      const subRes = await fetch(`/api/subscription/${user.id}`);
      if (subRes.ok) {
        const subData = await subRes.json();
        setSubscription(subData);
      }
    } catch {
      setCancelError("Error de red al cancelar la suscripción");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <>
        {/* Modal Mejorar Plan */}
        <UpgradePlanModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={handleStripe}
          loading={stripeLoading}
          error={stripeError}
          coupon={coupon}
          onCouponChange={setCoupon}
          onApplyCoupon={() => {}}
          couponLoading={couponLoading}
          couponError={couponError}
        />

        {/* Modal Cancelar Suscripción */}
        <CancelSubscriptionModal
          isOpen={showCancelModal}
          onClose={() => { setShowCancelModal(false); setCancelError(null); }}
          onConfirmCancel={handleCancelSubscription}
          loading={cancelLoading}
          error={cancelError}
        />

      <SettingsSection
        title="Información Personal"
        description="Visualiza y edita tu información de perfil"
      >
        <div className="bg-gray-100 rounded-lg p-4 md:p-6 space-y-4">
          {/* Avatar y ID */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-[#993331] to-[#BA5149] flex items-center justify-center text-white text-xl md:text-2xl font-bold flex-shrink-0">
              {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-500 mb-1">ID de Usuario</div>
              <div className="font-mono text-xs md:text-sm text-gray-700 break-all">{user?.id || "---"}</div>
              <div className="text-xs text-gray-500 mt-2">
                {user?.createdAt && `Miembro desde ${new Date(user.createdAt).toLocaleDateString('es-ES', { 
                  day: 'numeric',
                  month: 'long', 
                  year: 'numeric' 
                })}`}
              </div>
            </div>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-[#993331] bg-white border border-[#993331]/20 rounded-lg hover:bg-[#993331]/5 transition-colors"
              >
                Editar Perfil
              </button>
            )}
          </div>

          {/* Campos editables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-300">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993331] focus:border-transparent"
                  placeholder="Tu nombre"
                />
              ) : (
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                  {user?.firstName || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido
              </label>
              {isEditingProfile ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#993331] focus:border-transparent"
                  placeholder="Tu apellido"
                />
              ) : (
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                  {user?.lastName || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              {isEditingProfile ? (
                <div>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
                    placeholder="tu@email.com"
                    title="La actualización de email aún no está disponible"
                  />
                  <p className="text-xs text-gray-500 mt-1">La actualización de email aún no está disponible en el backend</p>
                </div>
              ) : (
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                  {user?.email || "No especificado"}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de nacimiento
              </label>
              {isEditingProfile ? (
                <div>
                  <input
                    type="date"
                    value={profileData.birthdate}
                    onChange={(e) => setProfileData({ ...profileData, birthdate: e.target.value })}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
                    title="La actualización de fecha de nacimiento aún no está disponible"
                  />
                  <p className="text-xs text-gray-500 mt-1">La actualización de fecha de nacimiento aún no está disponible en el backend</p>
                </div>
              ) : (
                <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-900">
                  {formatBirthdateForDisplay(user?.birthdate)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan actual
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg">
                <span className={`inline-flex items-center gap-2 text-sm font-medium ${
                  isSubscriptionActive ? 'text-[#993331]' : 'text-gray-600'
                }`}>
                  {isSubscriptionActive && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                  )}
                  {userPlanLabel}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Autenticación 2FA
              </label>
              <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg flex items-center justify-between">
                <span className={`text-sm ${user?.twoFactorEnabled ? 'text-green-600' : 'text-gray-500'}`}>
                  {user?.twoFactorEnabled ? 'Activada' : 'Desactivada'}
                </span>
                <Toggle 
                  enabled={user?.twoFactorEnabled || false} 
                  onChange={handleToggle2FA}
                  disabled={isEditingProfile}
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          {isEditingProfile && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-300">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#993331] to-[#BA5149] rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="Seguridad"
        description="Gestiona la seguridad de tu cuenta"
      >
        <SettingsItem
          label="Cambiar contraseña"
          description="Actualiza tu contraseña de acceso"
        >
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="px-4 py-2 text-sm font-medium text-[#993331] bg-[#993331]/10 rounded-lg hover:bg-[#993331]/20 transition-colors"
          >
            Cambiar
          </button>
        </SettingsItem>
      </SettingsSection>

      <SettingsSection
        title="Suscripción"
        description="Administra tu plan y facturación"
      >
        <SettingsItem
          label="Plan actual"
          description={userPlanLabel}
        >
          {!isSubscriptionActive && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#993331] to-[#BA5149] rounded-lg hover:shadow-lg transition-all"
              onClick={() => setShowUpgradeModal(true)}>
              Mejorar Plan
            </button>
          )}
          {isSubscriptionActive && (
            <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
              Activo
            </span>
          )}
        </SettingsItem>

        {(user?.subscribed || (subscription && subscription.current_period_end && new Date(subscription.current_period_end) > new Date() && user?.subscribed === false)) && (
          <>
            <SettingsItem
              label="Estado de suscripción"
              description={subscriptionLoading ? "Cargando..." : (() => {
                if (user?.subscribed) {
                  if (subscription?.status === 'active') return 'Activa';
                  if (subscription?.status === 'canceled') return 'Cancelada';
                  return subscription?.status || 'Desconocido';
                }
                if (subscription && subscription.current_period_end && new Date(subscription.current_period_end) > new Date()) {
                  return `Cancelada (beneficios hasta ${new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })})`;
                }
                return 'No disponible';
              })()}
            >
              <span className={`px-4 py-2 text-sm font-medium rounded-lg ${
                user?.subscribed && subscription?.status === 'active' ? 'text-green-700 bg-green-50' :
                (!user?.subscribed && subscription && subscription.current_period_end && new Date(subscription.current_period_end) > new Date()) ? 'text-yellow-700 bg-yellow-50' :
                'text-red-700 bg-red-50'
              }`}>
                {(() => {
                  if (user?.subscribed) {
                    if (subscription?.status === 'active') return 'Activa';
                    if (subscription?.status === 'canceled') return 'Cancelada';
                    return subscription?.status || 'Desconocido';
                  }
                  if (subscription && subscription.current_period_end && new Date(subscription.current_period_end) > new Date()) {
                    return `Cancelada (beneficios hasta ${new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })})`;
                  }
                  return 'No disponible';
                })()}
              </span>
            </SettingsItem>

            <SettingsItem
              children
              label="Fecha de inicio"
              description={subscriptionLoading ? "Cargando..." : (subscription?.created_at ? 
                new Date(subscription.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : "No disponible")}
            />

            <SettingsItem
              children
              label="Vigencia"
              description={subscriptionLoading ? "Cargando..." : (subscription?.current_period_end ? 
                new Date(subscription.current_period_end).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                }) : "No disponible")}
            />

            {/* Botón de cancelar suscripción — solo visible si la suscripción está activa */}
            {isSubscriptionActive && (
              <SettingsItem
                label="Cancelar suscripción"
                description="Puedes cancelar tu suscripción en cualquier momento"
              >
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Cancelar plan
                </button>
              </SettingsItem>
            )}
          </>
        )}
      </SettingsSection>

      <SettingsSection
        title="Gestión de Cuenta"
        description="Opciones avanzadas de cuenta"
      >

        <SettingsItem
          label="Eliminar cuenta"
          description={showDeleteConfirm ? "¿Estás seguro? Esta acción es irreversible" : "Elimina permanentemente tu cuenta y datos"}
        >
          <button 
            onClick={handleDeleteAccount}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showDeleteConfirm 
                ? 'text-white bg-red-600 hover:bg-red-700' 
                : 'text-red-600 bg-red-50 hover:bg-red-100'
            }`}
          >
            {showDeleteConfirm ? "Confirmar Eliminación" : "Eliminar"}
          </button>
          {showDeleteConfirm && (
            <button 
              onClick={() => setShowDeleteConfirm(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          )}
        </SettingsItem>
      </SettingsSection>
    </>
  );
}
