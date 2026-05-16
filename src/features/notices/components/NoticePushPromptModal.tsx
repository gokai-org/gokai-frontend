"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BellRing, Settings2, X } from "lucide-react";
import type { PushNotificationState } from "@/features/notifications/lib/oneSignal";

interface NoticePushPromptModalProps {
  isOpen: boolean;
  pushState: PushNotificationState | null;
  loading: boolean;
  onClose: () => void;
  onActivate: () => void;
}

export function NoticePushPromptModal({
  isOpen,
  pushState,
  loading,
  onClose,
  onActivate,
}: NoticePushPromptModalProps) {
  const blockedByBrowser = pushState?.browserPermission === "denied";

  const title = blockedByBrowser
    ? "Desbloquea las notificaciones"
    : "Activa tus notificaciones";

  const description = blockedByBrowser
    ? "Las notificaciones de este sitio están bloqueadas en tu navegador. Habilítalas en los permisos del sitio y vuelve a intentar activarlas para recibir avisos aquí."
    : "Recibe recordatorios de repaso, avisos de racha y novedades de contenido directamente cuando entres a esta bandeja.";

  const helper = blockedByBrowser
    ? "Mientras sigan bloqueadas, esta ventana aparecerá al entrar a Avisos."
    : "Si las dejas desactivadas, te lo volveremos a recordar cada vez que entres a Avisos.";

  const ctaLabel = blockedByBrowser
    ? "Reintentar activación"
    : "Activar notificaciones";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="notice-push-prompt-title"
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-border-subtle bg-surface-elevated shadow-[0_28px_80px_rgba(0,0,0,0.22)]"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1.5 text-content-tertiary transition-colors hover:bg-surface-tertiary hover:text-content-primary"
              aria-label="Cerrar recordatorio"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="bg-[radial-gradient(circle_at_top,rgba(186,81,73,0.24),transparent_60%),linear-gradient(180deg,rgba(186,81,73,0.12),rgba(186,81,73,0))] px-6 pb-5 pt-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 text-accent shadow-inner backdrop-blur-sm dark:bg-white/10">
                {blockedByBrowser ? (
                  <Settings2 className="h-7 w-7" />
                ) : (
                  <BellRing className="h-7 w-7" />
                )}
              </div>

              <h2
                id="notice-push-prompt-title"
                className="text-xl font-bold text-content-primary"
              >
                {title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-content-secondary">
                {description}
              </p>
            </div>

            <div className="space-y-4 px-6 pb-6 pt-2">
              <div className="rounded-2xl border border-accent/15 bg-accent/5 px-4 py-3 text-xs font-medium leading-5 text-content-secondary">
                {helper}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-border-default bg-surface-secondary px-4 py-3 text-sm font-semibold text-content-secondary transition-colors hover:bg-surface-tertiary"
                >
                  Ahora no
                </button>

                <button
                  type="button"
                  onClick={onActivate}
                  disabled={loading}
                  className="rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-content-inverted transition-all hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Activando..." : ctaLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}