"use client";

import { useState, useEffect } from "react";
import { SettingsSidebar } from "@/components/configuration/SettingsSidebar";
import { SettingsSection } from "@/components/configuration/SettingsSection";
import { SettingsItem } from "@/components/configuration/SettingsItem";
import { SettingsSelectItem, SettingsToggleItem, SettingsToggleSelectItem } from "@/components/configuration/SettingsFields";
import { Toggle } from "@/components/ui/Toggle";
import { IntegrationButton } from "@/components/configuration/IntegrationButton";
import { getCurrentUser, type User } from "@/lib/api/user";
import { useToast } from "@/components/ui/ToastProvider";

const sectionTitles: Record<string, string> = {
  general: "Configuración General",
  notifications: "Notificaciones",
  appearance: "Apariencia",
  language: "Idioma y Región",
  learning: "Preferencias de Estudio",
  accessibility: "Accesibilidad",
  privacy: "Privacidad",
  account: "Cuenta",
};

export default function ConfigurationPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {sectionTitles[activeSection] || "Configuración"}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-gray-600">
              Personaliza tu experiencia de aprendizaje de japonés
            </p>
          </div>

          <div className="space-y-6 md:space-y-8">
            {activeSection === "general" && <GeneralSettings />}
            {activeSection === "notifications" && <NotificationSettings />}
            {activeSection === "appearance" && <AppearanceSettings />}
            {activeSection === "language" && <LanguageSettings />}
            {activeSection === "learning" && <LearningSettings />}
            {activeSection === "accessibility" && <AccessibilitySettings />}
            {activeSection === "privacy" && <PrivacySettings />}
            {activeSection === "account" && <AccountSettings user={user} setUser={setUser} loading={loading} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function GeneralSettings() {
  return (
    <>
      <SettingsSection
        title="Preferencias Generales"
        description="Configura los ajustes básicos de la plataforma"
      >
        <SettingsToggleItem
          label="Reproducción automática"
          description="Reproduce automáticamente el siguiente ejercicio"
          enabled={true}
        />

        <SettingsToggleItem
          label="Mostrar romaji"
          description="Muestra la romanización de los caracteres japoneses"
          enabled={false}
        />

        <SettingsToggleItem
          label="Confirmación de respuestas"
          description="Requiere confirmación antes de enviar respuestas"
          enabled={true}
        />
      </SettingsSection>

      <SettingsSection
        title="Sesiones de Estudio"
        description="Personaliza tus sesiones de práctica"
      >
        <SettingsSelectItem
          label="Duración de sesión"
          description="Tiempo predeterminado para sesiones de estudio"
          value="30 min"
          options={["15 min", "30 min", "45 min", "60 min"]}
        />

        <SettingsToggleItem
          label="Recordatorios de descanso"
          description="Te avisaremos cuando sea momento de descansar"
          enabled={true}
        />
      </SettingsSection>
    </>
  );
}

function NotificationSettings() {
  return (
    <>
      <SettingsSection
        title="Notificaciones por Email"
        description="Recibe actualizaciones importantes por correo electrónico"
      >
        <SettingsToggleSelectItem
          label="Frecuencia de notificaciones"
          description="Con qué frecuencia quieres recibir notificaciones agrupadas"
          toggleEnabled={true}
          value="Diario"
          options={["Inmediato", "Cada 3 horas", "Diario", "Semanal"]}
        />

        <SettingsToggleItem
          label="Alertas prioritarias"
          description="Notificaciones críticas que te pueden interrumpir"
          enabled={true}
        />
      </SettingsSection>

      <SettingsSection
        title="Integraciones"
        description="Conecta tus aplicaciones favoritas"
      >
        <div className="flex flex-wrap gap-3">
          <IntegrationButton name="Discord" icon="💬" connected={true} />
          <IntegrationButton name="Telegram" icon="📱" connected={false} />
          <IntegrationButton name="Slack" icon="💼" connected={false} />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Horarios Silenciosos"
        description="No recibirás notificaciones durante tus horas de descanso"
      >
        <SettingsToggleItem
          label="Activar horario silencioso"
          description="Define cuándo no quieres ser interrumpido"
          enabled={true}
        />

        <div className="grid grid-cols-2 gap-4">
          <SettingsSelectItem
            label="Días de la semana"
            value="Lunes - Viernes"
            options={["Todos los días", "Lunes - Viernes", "Fines de semana", "Personalizado"]}
          />
          <SettingsSelectItem
            label="Horario"
            value="22:00 - 08:00"
            options={["21:00 - 07:00", "22:00 - 08:00", "23:00 - 09:00", "Personalizado"]}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Sonidos y Alertas"
        description="Personaliza los sonidos de notificación"
      >
        <SettingsSelectItem
          label="Sonido personalizado"
          description="Elige el sonido que se reproduce con las notificaciones"
          value="Campana"
          options={["Campana", "Gong japonés", "Suave", "Ninguno"]}
        />

        <SettingsSelectItem
          label="Estilo de banner"
          description="Cómo se muestran las notificaciones en pantalla"
          value="Predeterminado"
          options={["Predeterminado", "Minimalista", "Compacto"]}
        />
      </SettingsSection>
    </>
  );
}

function AppearanceSettings() {
  return (
    <>
      <SettingsSection
        title="Tema Visual"
        description="Personaliza la apariencia de la interfaz"
      >
        <SettingsToggleItem
          label="Modo oscuro"
          description="Activa el tema oscuro para reducir la fatiga visual"
          enabled={false}
        />

        <SettingsSelectItem
          label="Tema de colores"
          description="Selecciona el esquema de colores principal"
          value="Morado (Predeterminado)"
          options={["Morado (Predeterminado)", "Azul", "Rosa", "Verde", "Naranja"]}
        />
      </SettingsSection>

      <SettingsSection
        title="Tipografía"
        description="Ajusta el tamaño y estilo del texto"
      >
        <SettingsSelectItem
          label="Tamaño de fuente"
          description="Tamaño del texto en la interfaz"
          value="Mediano"
          options={["Pequeño", "Mediano", "Grande", "Muy grande"]}
        />

        <SettingsSelectItem
          label="Fuente para japonés"
          description="Tipografía para caracteres japoneses"
          value="Noto Sans JP"
          options={["Noto Sans JP", "Hiragino", "Yu Gothic", "Meiryo"]}
        />
      </SettingsSection>
    </>
  );
}

function LanguageSettings() {
  return (
    <>
      <SettingsSection
        title="Idioma de la Interfaz"
        description="Selecciona el idioma de la plataforma"
      >
        <SettingsSelectItem
          label="Idioma principal"
          description="Idioma en el que se muestra la interfaz"
          value="Español"
          options={["Español", "English", "日本語", "Português", "Français"]}
        />
      </SettingsSection>

      <SettingsSection
        title="Configuración Regional"
        description="Ajusta los formatos según tu región"
      >
        <SettingsSelectItem
          label="Zona horaria"
          description="Tu zona horaria local"
          value="GMT-6 (Ciudad de México)"
          options={["GMT-6 (Ciudad de México)", "GMT-5 (Bogotá)", "GMT-3 (Buenos Aires)", "GMT+9 (Tokio)"]}
        />

        <SettingsSelectItem
          label="Formato de fecha"
          description="Cómo se muestran las fechas"
          value="DD/MM/AAAA"
          options={["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"]}
        />
      </SettingsSection>
    </>
  );
}

function LearningSettings() {
  return (
    <>
      <SettingsSection
        title="Nivel y Objetivos"
        description="Define tu nivel actual y metas de aprendizaje"
      >
        <SettingsSelectItem
          label="Nivel actual"
          description="Tu nivel de japonés actual"
          value="N4 - Intermedio"
          options={["N5 - Principiante", "N4 - Intermedio", "N3 - Intermedio Alto", "N2 - Avanzado", "N1 - Experto"]}
        />

        <SettingsSelectItem
          label="Meta diaria"
          description="Tiempo de estudio diario que deseas alcanzar"
          value="30 minutos"
          options={["15 minutos", "30 minutos", "45 minutos", "60 minutos", "90 minutos"]}
        />
      </SettingsSection>

      <SettingsSection
        title="Preferencias de Ejercicios"
        description="Personaliza los tipos de ejercicios"
      >
        <SettingsToggleItem
          label="Enfoque en kanji"
          description="Priorizar ejercicios de kanji en tus sesiones"
          enabled={true}
        />

        <SettingsToggleItem
          label="Ejercicios de audio"
          description="Incluir más ejercicios de comprensión auditiva"
          enabled={true}
        />

        <SettingsToggleItem
          label="Práctica de conversación"
          description="Activar ejercicios de expresión oral"
          enabled={false}
        />

        <SettingsSelectItem
          label="Dificultad de ejercicios"
          description="Nivel de dificultad de los nuevos ejercicios"
          value="Adaptativo"
          options={["Fácil", "Medio", "Difícil", "Adaptativo"]}
        />
      </SettingsSection>

      <SettingsSection
        title="Sistema de Repaso"
        description="Configura el sistema de repetición espaciada"
      >
        <SettingsSelectItem
          label="Repasos diarios"
          description="Cantidad máxima de repasos por día"
          value="50 tarjetas"
          options={["20 tarjetas", "50 tarjetas", "100 tarjetas", "Ilimitado"]}
        />

        <SettingsToggleItem
          label="Notificar repasos pendientes"
          description="Recibir recordatorios de contenido por repasar"
          enabled={true}
        />
      </SettingsSection>
    </>
  );
}

function AccessibilitySettings() {
  return (
    <>
      <SettingsSection
        title="Ayudas Visuales"
        description="Mejora la legibilidad y navegación"
      >
        <SettingsToggleItem
          label="Alto contraste"
          description="Aumenta el contraste para mejor legibilidad"
          enabled={false}
        />

        <SettingsToggleItem
          label="Resaltar enfoque"
          description="Resalta el elemento activo al navegar con teclado"
          enabled={true}
        />

        <SettingsToggleItem
          label="Reducir animaciones"
          description="Minimiza animaciones y transiciones"
          enabled={false}
        />
      </SettingsSection>

      <SettingsSection
        title="Audio y Voz"
        description="Configuración de audio y lectura de pantalla"
      >
        <SettingsSelectItem
          label="Velocidad de audio"
          description="Velocidad de reproducción del audio japonés"
          value="Normal"
          options={["Muy lento", "Lento", "Normal", "Rápido"]}
        />

        <SettingsToggleItem
          label="Lector de pantalla"
          description="Optimizar para lectores de pantalla"
          enabled={false}
        />
      </SettingsSection>

      <SettingsSection
        title="Navegación"
        description="Personaliza la navegación de la plataforma"
      >
        <SettingsToggleItem
          label="Atajos de teclado"
          description="Habilitar atajos de teclado para navegación rápida"
          enabled={true}
        />

        <SettingsToggleItem
          label="Navegación simplificada"
          description="Interfaz simplificada con menos elementos"
          enabled={false}
        />
      </SettingsSection>
    </>
  );
}

function PrivacySettings() {
  return (
    <>
      <SettingsSection
        title="Datos y Privacidad"
        description="Controla tu información personal"
      >
        <SettingsToggleItem
          label="Perfil público"
          description="Permite que otros usuarios vean tu perfil"
          enabled={false}
        />

        <SettingsToggleItem
          label="Mostrar progreso"
          description="Compartir tu progreso en tablas de clasificación"
          enabled={true}
        />

        <SettingsToggleItem
          label="Recopilación de datos de uso"
          description="Ayúdanos a mejorar compartiendo datos anónimos"
          enabled={true}
        />
      </SettingsSection>

      <SettingsSection
        title="Compartir Actividad"
        description="Qué actividades pueden ver otros usuarios"
      >
        <SettingsToggleItem
          label="Racha de estudio"
          description="Mostrar tu racha actual de días de estudio"
          enabled={true}
        />

        <SettingsToggleItem
          label="Ejercicios completados"
          description="Compartir cuántos ejercicios has completado"
          enabled={false}
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

  // Actualizar profileData cuando cambie el usuario
  useEffect(() => {
    if (user) {
      // Formatear fecha correctamente para evitar problemas de zona horaria
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        birthdate: formatBirthdateForInput(user.birthdate),
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Solo enviar firstName y lastName (único que el backend soporta actualizar)
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
          // Actualizar el estado del usuario con los datos normalizados
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

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/auth/user/export");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gokai-data-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Datos exportados correctamente");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Error al exportar datos");
    }
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

  return (
    <>
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
                  user?.plan === 'free' ? 'text-gray-600' : 'text-[#993331]'
                }`}>
                  {user?.plan === 'free' && 'Plan Gratuito'}
                  {user?.plan === 'premium' && 'Plan Premium'}
                  {user?.plan === 'pro' && 'Plan Pro'}
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
          description={user?.plan ? planNames[user.plan] : "No disponible"}
        >
          {user?.plan === "free" && (
            <button className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#993331] to-[#BA5149] rounded-lg hover:shadow-lg transition-all">
              Mejorar Plan
            </button>
          )}
          {user?.plan !== "free" && (
            <span className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-lg">
              Activo
            </span>
          )}
        </SettingsItem>
      </SettingsSection>

      <SettingsSection
        title="Gestión de Cuenta"
        description="Opciones avanzadas de cuenta"
      >
        <SettingsItem
          label="Exportar datos"
          description="Descarga una copia de tus datos personales"
        >
          <button 
            onClick={handleExportData}
            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Exportar
          </button>
        </SettingsItem>

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
