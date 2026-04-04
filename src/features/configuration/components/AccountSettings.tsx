"use client";

import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  Crown,
  ShieldCheck,
  Calendar,
  RefreshCw,
  Pencil,
  X,
  Check,
  AlertTriangle,
  KeyRound,
  Trash2,
  Sparkles,
  BadgeCheck,
} from "lucide-react";
import { useToast } from "@/shared/ui/ToastProvider";
import { getCurrentUser } from "@/features/auth/services/api";
import type { User } from "@/features/auth/types";
import { ChangePasswordModal } from "@/features/configuration/components/ChangePasswordModal";
import { UpgradePlanModal } from "@/features/configuration/components/UpgradePlanModal";
import { CancelSubscriptionModal } from "@/features/configuration/components/CancelSubscriptionModal";
import { AccountSettingsSkeleton } from "@/features/configuration/components/AccountSettingsSkeleton";

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmtDate(value: unknown): string {
  if (!value) return "No disponible";
  const d = new Date(String(value));
  if (isNaN(d.getTime())) return "No disponible";
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function fmtBirthday(value?: string | Date | null): string {
  if (!value) return "No especificado";
  const d = new Date(value);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function fmtBirthdayInput(value?: string | Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

function initials(user: User | null): string {
  if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
  if (user?.email) return user.email.charAt(0).toUpperCase();
  return "U";
}

// ─── Input field used in the edit form ────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
  disabled = false,
  type = "text",
  note,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  disabled?: boolean;
  type?: string;
  note?: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide text-content-tertiary">
          {label}
        </label>
        {note && (
          <span className="text-[10px] text-content-muted bg-surface-tertiary px-1.5 py-0.5 rounded">
            {note}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`w-full px-3.5 py-2.5 text-sm rounded-xl border outline-none transition-all ${
          disabled
            ? "bg-surface-tertiary border-border-subtle text-content-muted cursor-not-allowed"
            : "bg-surface-primary border-border-default text-content-primary focus:border-accent focus:ring-2 focus:ring-accent/20"
        }`}
      />
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  description,
  icon: Icon,
  children,
  delay = 0,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.32,
        ease: "easeOut",
        delay,
        layout: { type: "spring", stiffness: 320, damping: 30 },
      }}
      className="rounded-2xl border border-border-default bg-surface-elevated shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border-subtle bg-surface-secondary">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-subtle">
          <Icon className="w-4 h-4 text-accent" />
        </div>
        <div>
          <p className="text-sm font-semibold text-content-primary">{title}</p>
          {description && (
            <p className="text-xs text-content-muted">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
}

export function AccountSettings({ user, setUser, loading }: Props) {
  const toast = useToast();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Profile form state
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", birthdate: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Subscription state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [subscription, setSubscription] = useState<any>(null);
  const [subLoading, setSubLoading] = useState(false);

  // Upgrade / Coupon state
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Cancel state
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Sync form when user loads
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        birthdate: fmtBirthdayInput(user.birthdate),
      });
    }
  }, [user]);

  // Load subscription
  useEffect(() => {
    if (!user?.id) return;
    setSubLoading(true);
    fetch("/api/subscription/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setSubscription(data); })
      .catch(console.error)
      .finally(() => setSubLoading(false));
  }, [user?.id]);

  // ── Subscription helpers ───────────────────────────────────────────────────

  const subEndDate = parseDate(
    subscription?.current_period_end ?? subscription?.expires_at ?? subscription?.expiry_date ?? subscription?.vigency,
  );
  const subStartDate = parseDate(subscription?.created_at ?? subscription?.start_date);
  const hasRecurring = subscription?.has_recurring_payment !== false;
  const isActive = !!(
    (user?.subscribed && subscription?.status === "active") ||
    subscription?.status === "active" ||
    (user?.subscribed && subEndDate && subEndDate > new Date())
  );
  const isCouponBased = isActive && !hasRecurring;
  const planLabel = isActive ? "GOKAI+" : user?.plan === "premium" ? "Plan Premium" : "Plan Gratuito";

  // ── Actions ───────────────────────────────────────────────────────────────

  const refresh = async () => {
    const updated = await getCurrentUser();
    if (!updated) return;
    setUser(updated);
    const r = await fetch("/api/subscription/me");
    if (r.ok) setSubscription(await r.json());
  };

  const claimCoupon = async (code: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/subscription/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) return { success: false, error: data.error || "No se pudo aplicar el cupón" };
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
    const result = await claimCoupon(code);
    if (!result.success) { setCouponError(result.error ?? "No se pudo aplicar el cupón"); setCouponLoading(false); return; }
    await refresh();
    setCoupon("");
    setShowUpgradeModal(false);
    setCouponLoading(false);
    toast.success("Cupón aplicado. Tu suscripción está activa.");
  };

  const handleStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
    const code = coupon.trim();
    if (code) {
      const result = await claimCoupon(code);
      if (!result.success) { setCouponError(result.error ?? "No se pudo aplicar el cupón"); setStripeLoading(false); return; }
      await refresh();
      setCoupon("");
      setShowUpgradeModal(false);
      setStripeLoading(false);
      toast.success("Cupón aplicado. Tu suscripción está activa.");
      return;
    }
    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ successUrl: window.location.href }),
      });
      const data = await res.json();
      if (data.url) { window.location.href = data.url; return; }
      setStripeError(data.error || "Error al iniciar pago");
    } catch { setStripeError("Error de red"); }
    finally { setStripeLoading(false); }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;
    setCancelLoading(true);
    setCancelError(null);
    try {
      const res = await fetch(`/api/subscription/${user.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setCancelError(data.error || "Error al cancelar"); return; }
      toast.success("Suscripción cancelada.");
      setShowCancelModal(false);
      await refresh();
    } catch { setCancelError("Error de red al cancelar."); }
    finally { setCancelLoading(false); }
  };

  const handleSave = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });
      if (!res.ok) { const d = await res.json(); toast.error(d.error || "Error al guardar"); return; }
      const d = await res.json();
      if (d.user) {
        setUser(d.user);
        setForm({ firstName: d.user.firstName || "", lastName: d.user.lastName || "", email: d.user.email || "", birthdate: fmtBirthdayInput(d.user.birthdate) });
        setIsEditing(false);
        toast.success("Perfil actualizado.");
      }
    } catch { toast.error("Error al guardar los cambios"); }
    finally { setIsSaving(false); }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setForm({ firstName: user?.firstName || "", lastName: user?.lastName || "", email: user?.email || "", birthdate: fmtBirthdayInput(user?.birthdate) });
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────

  if (loading) return <AccountSettingsSkeleton />;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onPasswordChanged={() => toast.success("¡Contraseña actualizada correctamente!")}
        userEmail={user?.email ?? ""}
      />
      <UpgradePlanModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleStripe}
        loading={stripeLoading}
        error={stripeError}
        coupon={coupon}
        onCouponChange={(v) => { setCoupon(v); if (couponError) setCouponError(null); }}
        onApplyCoupon={handleApplyCoupon}
        couponLoading={couponLoading}
        couponError={couponError}
      />
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => { setShowCancelModal(false); setCancelError(null); }}
        onConfirmCancel={handleCancelSubscription}
        loading={cancelLoading}
        error={cancelError}
      />

      <div className="space-y-6">
        {/* ── Profile card ──────────────────────────────────────────────────── */}
        <Section title="Información Personal" description="Tu identidad en la plataforma" icon={BadgeCheck} delay={0}>
          {/* Hero banner + avatar */}
          <div className="-mx-6 -mt-6 mb-6">
            <div className="relative h-20 sm:h-24 bg-gradient-to-r from-accent/20 via-accent/10 to-transparent overflow-hidden">
              {/* Decorative kanji */}
              <span className="absolute right-4 sm:right-6 top-1 text-[58px] sm:text-[72px] font-bold text-accent/5 select-none pointer-events-none leading-none">
                人
              </span>
              <span className="absolute right-20 sm:right-24 top-3 sm:top-4 text-[34px] sm:text-[40px] font-bold text-accent/5 select-none pointer-events-none leading-none">
                学
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 px-6 pb-2 pt-3">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-3.5 min-w-0 flex-1">
                <div className="relative -mt-12 sm:-mt-14 w-24 h-24 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center text-content-inverted text-3xl sm:text-3xl font-bold shadow-lg border-4 border-surface-elevated flex-shrink-0">
                  {initials(user)}
                  {isActive && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                      <Crown className="w-3 h-3 text-white" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 w-full sm:flex-1 text-center sm:text-left">
                  <p className="text-base sm:text-lg font-semibold text-content-primary leading-snug break-words">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Tu cuenta"}
                  </p>
                  <p className="text-xs text-content-muted leading-relaxed mt-0.5 max-w-full break-all sm:break-normal sm:truncate">
                    {user?.email}
                  </p>
                  <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-subtle border border-accent/15 px-2.5 py-0.5 align-middle">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-[11px] font-medium text-accent truncate">
                      {user?.createdAt ? `Miembro desde ${fmtDate(user.createdAt)}` : "Perfil activo"}
                    </span>
                  </div>
                </div>
              </div>
              {!isEditing && (
                <motion.button
                  layout
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditing(true)}
                  transition={{ layout: { type: "spring", stiffness: 380, damping: 32 } }}
                  className="flex w-full sm:w-auto justify-center sm:justify-start items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-content-secondary bg-surface-primary border border-border-default rounded-xl hover:bg-surface-secondary transition-colors shadow-sm shrink-0 self-center sm:self-start sm:mt-2"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Editar perfil
                </motion.button>
              )}
            </div>
          </div>

          {/* Fields */}
          <LayoutGroup>
            <motion.form
              layout
              transition={{ layout: { type: "spring", stiffness: 360, damping: 32 } }}
              onSubmit={handleSave}
            >
              <motion.div
                layout
                transition={{ layout: { type: "spring", stiffness: 360, damping: 32 } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Field
                  label="Nombre"
                  value={isEditing ? form.firstName : user?.firstName || "—"}
                  onChange={(v) => setForm((f) => ({ ...f, firstName: v }))}
                  disabled={!isEditing}
                />
                <Field
                  label="Apellido"
                  value={isEditing ? form.lastName : user?.lastName || "—"}
                  onChange={(v) => setForm((f) => ({ ...f, lastName: v }))}
                  disabled={!isEditing}
                />
                <Field
                  label="Correo electrónico"
                  value={isEditing ? form.email : user?.email || "—"}
                  disabled
                  type="email"
                  note={isEditing ? "No editable" : undefined}
                />
                <Field
                  label="Fecha de nacimiento"
                  value={isEditing ? form.birthdate : fmtBirthday(user?.birthdate)}
                  disabled
                  type={isEditing ? "date" : "text"}
                  note={isEditing ? "No editable" : undefined}
                />
              </motion.div>

              <AnimatePresence initial={false}>
                {isEditing && (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5 mt-5 pt-5 border-t border-border-subtle overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-content-secondary bg-surface-primary border border-border-default rounded-xl hover:bg-surface-secondary transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-content-inverted bg-accent rounded-xl hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isSaving ? (
                        <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</>
                      ) : (
                        <><Check className="w-3.5 h-3.5" />Guardar cambios</>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.form>
          </LayoutGroup>
        </Section>

        {/* ── Subscription card ──────────────────────────────────────────────── */}
        <Section title="Suscripción y Plan" description="Tu acceso y beneficios activos" icon={Crown} delay={0.06}>
          {isActive ? (
            <div className="space-y-5">
              {/* Premium hero strip */}
              <div className="relative rounded-xl bg-gradient-to-br from-accent/90 to-accent-hover overflow-hidden p-5 text-content-inverted shadow-md">
                <span className="absolute right-4 top-1 text-[64px] font-bold opacity-10 select-none leading-none">語</span>
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/70">Plan activo</span>
                    </div>
                    <p className="text-xl font-bold">{planLabel}</p>
                    <p className="text-xs text-white/70 mt-0.5">
                      {isCouponBased ? "Suscripción mediante cupón promocional" : "Renovación automática activa"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 rounded-full self-start sm:self-auto">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold">Activo</span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 bg-surface-secondary rounded-xl border border-border-subtle px-4 py-3.5">
                  <Calendar className="w-4 h-4 text-content-muted flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-content-muted uppercase tracking-wide font-semibold">Fecha de inicio</p>
                    <p className="text-sm font-semibold text-content-primary mt-0.5">
                      {subLoading ? <span className="animate-pulse">…</span> : fmtDate(subStartDate)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-surface-secondary rounded-xl border border-border-subtle px-4 py-3.5">
                  <RefreshCw className="w-4 h-4 text-content-muted flex-shrink-0" />
                  <div>
                    <p className="text-[11px] text-content-muted uppercase tracking-wide font-semibold">
                      {isCouponBased ? "Expira el" : "Próxima renovación"}
                    </p>
                    <p className="text-sm font-semibold text-content-primary mt-0.5">
                      {subLoading ? <span className="animate-pulse">…</span> : fmtDate(subEndDate)}
                    </p>
                  </div>
                </div>
              </div>

              {hasRecurring && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="text-xs font-medium text-content-muted hover:text-status-error transition-colors"
                  >
                    Cancelar suscripción
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-surface-secondary rounded-xl border border-border-subtle">
              <div className="flex-1">
                <p className="text-sm font-semibold text-content-primary">Plan Gratuito</p>
                <p className="text-xs text-content-muted mt-0.5">
                  Desbloquea todas las funciones premium para acelerar tu aprendizaje.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowUpgradeModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-content-inverted bg-gradient-to-r from-accent to-accent-hover rounded-xl shadow-sm hover:shadow-md transition-all whitespace-nowrap"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Mejorar plan
              </motion.button>
            </div>
          )}
        </Section>

        {/* ── Security card ──────────────────────────────────────────────────── */}
        <Section title="Seguridad" description="Credenciales y acceso a la cuenta" icon={ShieldCheck} delay={0.12}>
          <div className="space-y-3">
            {/* Change password row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-surface-secondary rounded-xl border border-border-subtle">
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-accent-subtle flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-content-primary">Contraseña</p>
                  <p className="text-xs text-content-muted">Actualiza tu contraseña regularmente</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowPasswordModal(true)}
                className="w-full sm:w-auto flex items-center justify-center px-3.5 py-2 text-xs font-semibold text-content-secondary bg-surface-primary border border-border-default rounded-xl hover:bg-surface-secondary transition-colors shadow-sm"
              >
                Cambiar
              </motion.button>
            </div>

            {/* Danger zone */}
            <div className="p-4 rounded-xl border border-status-error/20 bg-status-error-subtle">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-4 h-4 text-status-error mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-status-error">Zona de peligro</p>
                  <p className="text-xs text-status-error/70 mt-0.5">
                    Esta acción es irreversible. Todos tus datos se eliminarán permanentemente.
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {showDeleteConfirm ? (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex flex-col sm:flex-row gap-2"
                  >
                    <button
                      onClick={async () => {
                        try {
                          await fetch("/api/auth/user", { method: "DELETE" });
                          window.location.href = "/auth/login";
                        } catch { toast.error("Error al eliminar cuenta"); }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-content-inverted bg-status-error rounded-xl hover:bg-status-error/90 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Sí, eliminar definitivamente
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 text-sm font-medium text-content-secondary bg-surface-primary border border-border-default rounded-xl hover:bg-surface-secondary transition-colors"
                    >
                      Cancelar
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="btn"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-status-error bg-surface-primary border border-status-error/20 rounded-xl hover:bg-status-error-subtle hover:border-status-error/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Eliminar mi cuenta
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Section>
      </div>
    </>
  );
}
