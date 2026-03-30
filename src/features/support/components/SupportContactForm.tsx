"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  CheckCircle2,
  Loader2,
  ChevronDown,
  AlertCircle,
  Wrench,
  CreditCard,
  KeyRound,
  Bug,
  Lightbulb,
  MoreHorizontal,
  Headphones,
  Sparkles,
  Mail,
} from "lucide-react";
import { useSupportForm } from "@/features/support/hooks/useSupportForm";
import {
  SUPPORT_CATEGORY_LABELS,
  type SupportCategory,
  type SupportTicketResponse,
} from "@/features/support/types";

/* ── constants ── */
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_META: Record<
  SupportCategory,
  { icon: ReactNode; color: string; bg: string }
> = {
  technical_issue: {
    icon: <Wrench className="h-4 w-4" />,
    color: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  billing: {
    icon: <CreditCard className="h-4 w-4" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  account_access: {
    icon: <KeyRound className="h-4 w-4" />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
  },
  bug_report: {
    icon: <Bug className="h-4 w-4" />,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  feature_request: {
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
  },
  other: {
    icon: <MoreHorizontal className="h-4 w-4" />,
    color: "text-content-secondary",
    bg: "bg-surface-secondary",
  },
};

const CATEGORIES = Object.keys(SUPPORT_CATEGORY_LABELS) as SupportCategory[];

/* ── reusable FormField ── */
function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ── reusable FormInput ── */
function FormInput({
  type = "text",
  value,
  onChange,
  placeholder,
  hasError,
}: {
  type?: "text" | "email";
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hasError?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${
        hasError
          ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 focus:border-red-400 dark:focus:border-red-600"
          : "border-border-default bg-surface-primary hover:border-border-default focus:border-accent/40 focus:bg-accent/[0.02]"
      }`}
    />
  );
}

/* ── CategoryDropdown ── */
function CategoryDropdown({
  value,
  onChange,
  error,
}: {
  value: SupportCategory;
  onChange: (v: SupportCategory) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const meta = CATEGORY_META[value];

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-colors duration-200 ${
          error
            ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"
            : open
              ? "border-accent/30 bg-accent/5"
              : "border-border-default bg-surface-primary hover:border-border-default"
        }`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.bg} ${meta.color}`}
        >
          {meta.icon}
        </span>
        <span className="flex-1 font-medium text-content-primary">
          {SUPPORT_CATEGORY_LABELS[value]}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-content-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-2xl border border-border-default bg-surface-primary py-1 shadow-xl"
          >
            {CATEGORIES.map((cat) => {
              const m = CATEGORY_META[cat];
              const isSelected = cat === value;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onChange(cat);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? "bg-accent/5 text-accent"
                      : "text-content-secondary hover:bg-surface-secondary"
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-lg ${m.bg} ${m.color}`}
                  >
                    {m.icon}
                  </span>
                  <span className="font-medium">
                    {SUPPORT_CATEGORY_LABELS[cat]}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-500">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

/* ── SuccessView ── */
function SuccessView({ ticketId }: { ticketId: string | null }) {
  return (
    <div className="flex flex-col items-center py-8 text-center sm:py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100"
      >
        <CheckCircle2 className="h-8 w-8 text-emerald-600" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
        className="mb-2 text-lg font-extrabold text-content-primary"
      >
        ¡Ticket enviado!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.35 }}
        className="mb-1 text-sm text-content-tertiary"
      >
        Tu solicitud ha sido recibida correctamente.
      </motion.p>

      {ticketId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="mb-5 text-xs text-content-muted"
        >
          ID: <span className="font-mono font-medium">{ticketId}</span>
        </motion.p>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-content-muted"
      >
        Recibirás una respuesta en tu email.
      </motion.p>
    </div>
  );
}

/* ── Props ── */
interface SupportContactFormProps {
  open: boolean;
  onClose: () => void;
  defaults?: Partial<{ name: string; email: string }>;
  onSuccess?: (ticket: SupportTicketResponse) => void;
  onError?: (message: string) => void;
}

/* ── componente principal ── */
export default function SupportContactForm({
  open,
  onClose,
  defaults,
  onSuccess,
  onError,
}: SupportContactFormProps) {
  const {
    form,
    errors,
    submitError,
    submitting,
    submitted,
    ticketId,
    setField,
    submit,
    reset,
  } = useSupportForm({ defaults, onSuccess, onError });

  const handleClose = () => {
    onClose();
    setTimeout(reset, 350);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel — siempre modal centrado, responsive con max-w */}
          <motion.div
            className="support-modal-panel relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-[24px] bg-surface-primary shadow-2xl sm:rounded-[28px]"
            style={{ maxHeight: "min(92dvh, 720px)" }}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {/* Header */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-r from-accent to-accent-hover px-5 pb-5 pt-5 sm:px-8 sm:pb-6 sm:pt-7">
              <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-surface-primary/5" />
              <div className="absolute bottom-[-12px] left-[30%] h-16 w-16 rounded-full bg-surface-primary/5" />

              <div className="relative z-10 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-surface-primary/15 backdrop-blur-sm sm:h-14 sm:w-14">
                    <Headphones className="h-5 w-5 text-content-inverted sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-content-inverted sm:text-xl">
                      Contactar soporte
                    </h2>
                    <p className="mt-0.5 text-xs text-white/60 sm:text-sm">
                      Te responderemos en menos de 24 horas
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-surface-primary/10 text-white/70 transition-colors hover:bg-surface-primary/20 hover:text-content-inverted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Badges */}
              <div className="mt-4 hidden gap-2 sm:flex">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-primary/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                  <Sparkles className="h-3 w-3" /> Respuesta rápida
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-primary/10 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                  <Mail className="h-3 w-3" /> Vía email
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="support-modal-scroll flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">
              {!submitted ? (
                <div className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Nombre" error={errors.name}>
                      <FormInput
                        value={form.name}
                        onChange={(v) => setField("name", v)}
                        placeholder="Tu nombre"
                        hasError={!!errors.name}
                      />
                    </FormField>
                    <FormField label="Email" error={errors.email}>
                      <FormInput
                        type="email"
                        value={form.email}
                        onChange={(v) => setField("email", v)}
                        placeholder="tu@email.com"
                        hasError={!!errors.email}
                      />
                    </FormField>
                  </div>

                  {/* Category */}
                  <FormField label="Categoría" error={errors.category}>
                    <CategoryDropdown
                      value={form.category}
                      onChange={(v) => setField("category", v)}
                      error={errors.category}
                    />
                  </FormField>

                  {/* Subject */}
                  <FormField label="Asunto" error={errors.subject}>
                    <FormInput
                      value={form.subject}
                      onChange={(v) => setField("subject", v)}
                      placeholder="Describe brevemente tu problema"
                      hasError={!!errors.subject}
                    />
                  </FormField>

                  {/* Message */}
                  <FormField label="Mensaje" error={errors.message}>
                    <textarea
                      value={form.message}
                      onChange={(e) => setField("message", e.target.value)}
                      placeholder="Cuéntanos en detalle cómo podemos ayudarte..."
                      rows={4}
                      className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm outline-none transition-colors duration-200 ${
                        errors.message
                          ? "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 focus:border-red-400 dark:focus:border-red-600"
                          : "border-border-default bg-surface-primary hover:border-border-default focus:border-accent/40 focus:bg-accent/[0.02]"
                      }`}
                    />
                  </FormField>
                </div>
              ) : (
                <SuccessView ticketId={ticketId} />
              )}
            </div>

            {/* Footer */}
            <div className="shrink-0 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 sm:px-8">
              {!submitted ? (
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="hidden text-xs text-content-muted sm:block">
                    Responderemos a tu email en menos de 24 horas.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submit}
                    disabled={submitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-6 py-3 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all duration-200 hover:shadow-xl hover:shadow-accent/25 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Enviar ticket
                      </>
                    )}
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className="w-full rounded-2xl bg-content-primary px-6 py-3 text-sm font-bold text-content-inverted transition-colors hover:bg-content-secondary sm:w-auto"
                >
                  Cerrar
                </motion.button>
              )}
              {submitError && (
                <p className="mt-2 text-xs text-red-600">{submitError}</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
