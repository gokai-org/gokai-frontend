"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  onClose: () => void;
}

export function Toast({ type, message, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: {
      bg: "from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-900/40",
      border: "border-emerald-200 dark:border-emerald-700/40",
      text: "text-emerald-800 dark:text-emerald-200",
      icon: "text-emerald-600 dark:text-emerald-400",
      accent: "from-emerald-500 to-green-500",
    },
    error: {
      bg: "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/40",
      border: "border-red-200 dark:border-red-700/40",
      text: "text-red-800 dark:text-red-200",
      icon: "text-red-600 dark:text-red-400",
      accent: "from-red-500 to-red-600",
    },
    warning: {
      bg: "from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/40",
      border: "border-amber-200 dark:border-amber-700/40",
      text: "text-amber-800 dark:text-amber-200",
      icon: "text-amber-600 dark:text-amber-400",
      accent: "from-amber-500 to-amber-600",
    },
    info: {
      bg: "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/40",
      border: "border-blue-200 dark:border-blue-700/40",
      text: "text-blue-800 dark:text-blue-200",
      icon: "text-blue-600 dark:text-blue-400",
      accent: "from-blue-500 to-blue-600",
    },
  };

  const Icon = icons[type];
  const color = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      className="relative overflow-hidden"
    >
      {/* Borde decorativo japonés */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${color.accent}`}
      />

      <div
        className={`
        relative bg-gradient-to-br ${color.bg} 
        border ${color.border} 
        rounded-lg shadow-lg backdrop-blur-sm
        dark:shadow-black/40
        p-4
        min-w-[320px] max-w-md
      `}
      >
        {/* Patrón japonés sutil de fondo */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="seigaiha"
                x="0"
                y="0"
                width="40"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle
                  cx="10"
                  cy="20"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
                <circle
                  cx="30"
                  cy="20"
                  r="10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#seigaiha)" />
          </svg>
        </div>

        {/* Botón cerrar - posición absoluta en la esquina superior derecha */}
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          className={`
            absolute top-2 right-2 z-10
            ${color.text} hover:opacity-80
            transition-opacity rounded-full
            p-1.5
          `}
        >
          <X className="w-4 h-4" />
        </motion.button>

        <div className="relative flex items-start gap-3 pr-8">
          {/* Agregado pr-8 para dar espacio al botón cerrar */}
          {/* Icono animado */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
          >
            <Icon className={`w-5 h-5 ${color.icon} flex-shrink-0`} />
          </motion.div>

          {/* Mensaje */}
          <div className="flex-1 pt-0.5">
            <p className={`text-sm font-medium ${color.text} leading-relaxed`}>
              {message}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: 4, ease: "linear" }}
          className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${color.accent} origin-left`}
        />
      </div>
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
    <div className="fixed top-4 right-4 z-[9999] pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
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
