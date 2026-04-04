"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

const TOAST_CONFIG = {
  success: {
    label: "やった！ ¡Lo lograste!",
    Icon: CheckCircle2,
    bg: "bg-emerald-500",
    ring: "ring-1 ring-emerald-400/30",
    iconBg: "bg-emerald-700/40",
    shadow: "shadow-emerald-600/30",
  },
  error: {
    label: "しまった！ Algo salió mal",
    Icon: XCircle,
    bg: "bg-[#993331]",
    ring: "ring-1 ring-[#ba5149]/30",
    iconBg: "bg-[#7a2826]/50",
    shadow: "shadow-[#993331]/30",
  },
  warning: {
    label: "気をつけて · ¡Ojo!",
    Icon: AlertTriangle,
    bg: "bg-amber-500",
    ring: "ring-1 ring-amber-400/30",
    iconBg: "bg-amber-700/40",
    shadow: "shadow-amber-600/30",
  },
  info: {
    label: "ちょっと待って · Info",
    Icon: Info,
    bg: "bg-blue-500",
    ring: "ring-1 ring-blue-400/30",
    iconBg: "bg-blue-700/40",
    shadow: "shadow-blue-600/30",
  },
} as const;

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const { label, Icon, bg, ring, iconBg, shadow } = TOAST_CONFIG[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 72, scale: 0.88 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.88 }}
      transition={{ type: "spring", stiffness: 420, damping: 28 }}
      className={`relative overflow-hidden rounded-2xl ${bg} ${ring} shadow-2xl ${shadow} w-full sm:w-auto sm:min-w-[300px] sm:max-w-[400px]`}
    >
      {/* Blob 1 — esquina superior derecha */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full bg-white/10"
      />
      {/* Blob 2 — esquina inferior izquierda */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/10"
      />
      {/* Blob 3 — centro derecho, pequeño */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-14 -translate-y-1/2 h-7 w-7 rounded-full bg-white/10"
      />

      {/* Contenido */}
      <div className="relative z-10 flex items-center gap-4 px-5 py-4 pr-12">
        {/* Círculo del ícono */}
        <motion.div
          initial={{ scale: 0, rotate: -120 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.06, type: "spring", stiffness: 500, damping: 22 }}
          className={`flex-shrink-0 ${iconBg} rounded-full p-2.5`}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2.5} />
        </motion.div>

        {/* Texto */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/60 mb-0.5 leading-none">
            {label}
          </p>
          <p className="text-sm font-semibold text-white leading-snug break-words">
            {message}
          </p>
        </div>
      </div>

      {/* Botón cerrar */}
      <motion.button
        type="button"
        aria-label="Cerrar notificación"
        onClick={onClose}
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.85 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="absolute right-3 top-3 z-20 rounded-full p-1.5 text-white/60 hover:text-white hover:bg-white/15 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </motion.button>

      {/* Barra de progreso */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: "linear" }}
        className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/30 origin-left"
      />
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Array<{
    id: string;
    type: ToastType;
    message: string;
  }>;
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-[9999] pointer-events-none">
      <div className="flex flex-col gap-3 items-stretch sm:items-end pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              id={toast.id}
              type={toast.type}
              message={toast.message}
              onClose={() => onClose(toast.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
