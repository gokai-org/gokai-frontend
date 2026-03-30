"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  Bot,
  BarChart3,
  Network,
  Sparkles,
  BookOpen,
  Zap,
  HeartCrack,
  ArrowLeft,
  Crown,
  ShieldAlert,
  TrendingDown,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type CancelStep = "confirm" | "losing" | "final";

const FEATURES_LOSING = [
  { icon: Bot, label: "Chatbot ilimitado con IA" },
  { icon: BarChart3, label: "Estadísticas avanzadas de progreso" },
  { icon: Network, label: "Grafo completo de kanji" },
  { icon: Sparkles, label: "IA adaptativa personalizada" },
  { icon: BookOpen, label: "Repasos inteligentes ilimitados" },
  { icon: Zap, label: "Acceso anticipado a nuevas funciones" },
];

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 28, stiffness: 320 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const stepVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -60 : 60 }),
};

const STEP_ORDER: CancelStep[] = ["confirm", "losing", "final"];

/* ═══ Configuraciones visuales por paso ═══ */
const STEP_CONFIG = {
  confirm: {
    gradient: "from-amber-500 to-orange-500",
    gradientLight: "from-amber-50 to-orange-50",
    icon: AlertTriangle,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "¿Cancelar tu suscripción?",
    subtitle: "Antes de irte, queremos asegurarnos",
    accent: "amber",
  },
  losing: {
    gradient: "from-rose-500 to-red-500",
    gradientLight: "from-rose-50 to-red-50",
    icon: HeartCrack,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "Esto es lo que perderás",
    subtitle: "Funciones exclusivas de GOKAI+",
    accent: "red",
  },
  final: {
    gradient: "from-gray-600 to-gray-500",
    gradientLight: "from-gray-100 to-gray-50",
    icon: ShieldAlert,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "Última oportunidad",
    subtitle: "Esta acción no se puede deshacer fácilmente",
    accent: "gray",
  },
} as const;

export function CancelSubscriptionModal({
  isOpen,
  onClose,
  onConfirmCancel,
  loading = false,
  error = null,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState<CancelStep>("confirm");
  const [direction, setDirection] = useState(1);

  const goTo = (next: CancelStep) => {
    const cur = STEP_ORDER.indexOf(step);
    const nxt = STEP_ORDER.indexOf(next);
    setDirection(nxt > cur ? 1 : -1);
    setStep(next);
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const handleKeepPlan = () => {
    setStep("confirm");
    onClose();
  };

  const cfg = STEP_CONFIG[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Scroll container */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            {/* Modal — horizontal desktop, vertical móvil */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg md:max-w-3xl overflow-hidden rounded-2xl bg-surface-primary shadow-2xl ring-1 ring-border-subtle my-4 flex flex-col md:flex-row"
            >
              {/* ═══ PANEL IZQUIERDO — Gradiente dinámico ═══ */}
              <motion.div
                className={`relative flex flex-col justify-between bg-gradient-to-br ${cfg.gradient} text-content-inverted overflow-hidden md:w-[320px] md:min-h-[460px] flex-shrink-0`}
                layout
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Elementos decorativos */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-surface-primary/10" />
                <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-surface-primary/5" />

                {/* Cerrar (móvil) */}
                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 md:hidden rounded-full p-1.5 text-white/70 hover:text-content-inverted hover:bg-surface-primary/10 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <div className="relative z-[1] px-6 pt-6 pb-6 md:pt-8 md:px-7 md:pb-0">
                  {/* Volver */}
                  {step !== "confirm" && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() =>
                        goTo(step === "final" ? "losing" : "confirm")
                      }
                      className="mb-4 flex items-center gap-1 text-xs text-white/70 hover:text-content-inverted transition-colors"
                    >
                      <ArrowLeft size={14} /> Volver
                    </motion.button>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl ${cfg.iconBg} backdrop-blur-sm`}
                          initial={{ scale: 0.5, rotate: -20 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring" as const,
                            damping: 15,
                            stiffness: 250,
                          }}
                        >
                          <cfg.icon size={24} className={cfg.iconColor} />
                        </motion.div>
                        <div>
                          <h2 className="text-xl font-extrabold tracking-tight">
                            {cfg.title}
                          </h2>
                          <p className="text-sm text-white/75">
                            {cfg.subtitle}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Indicador de pasos (solo desktop) */}
                  <motion.div
                    className="mt-8 hidden md:flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {STEP_ORDER.map((s, idx) => (
                      <motion.div
                        key={s}
                        className={`h-1.5 rounded-full transition-all duration-400 ${
                          STEP_ORDER.indexOf(step) >= idx
                            ? "bg-surface-primary w-8"
                            : "bg-surface-primary/30 w-4"
                        }`}
                        layout
                      />
                    ))}
                    <span className="ml-2 text-xs text-white/50">
                      Paso {STEP_ORDER.indexOf(step) + 1} de 3
                    </span>
                  </motion.div>

                  {/* Stat persuasiva (solo desktop) */}
                  <motion.div
                    className="mt-6 hidden md:block rounded-xl bg-surface-primary/10 backdrop-blur-sm p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingDown size={20} className="text-white/80" />
                      <div>
                        <p className="text-sm font-bold">3x más rápido</p>
                        <p className="text-xs text-white/60">
                          Los usuarios GOKAI+ aprenden más rápido en promedio
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Crown badge (solo desktop) */}
                <motion.div
                  className="hidden md:flex items-center gap-2 px-7 pb-6 text-white/40 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <Crown size={14} />
                  <span>GOKAI+ · Tu plan activo</span>
                </motion.div>
              </motion.div>

              {/* ═══ PANEL DERECHO — Contenido por paso ═══ */}
              <div className="flex flex-1 flex-col min-w-0">
                {/* Cerrar (desktop) */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 hidden md:flex rounded-full p-1.5 text-content-muted hover:text-content-secondary hover:bg-surface-tertiary transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <AnimatePresence mode="wait" custom={direction}>
                  {/* ── STEP 1: Confirmar intención ── */}
                  {step === "confirm" && (
                    <motion.div
                      key="confirm"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 px-5 py-5 md:px-6 md:pt-8 md:pb-4 space-y-4">
                        <motion.div
                          className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.35 }}
                        >
                          <p className="text-sm text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                            Tu suscripción GOKAI+ seguirá activa hasta el final
                            de tu período de facturación actual. Después de eso,
                            perderás acceso a todas las funciones premium.
                          </p>
                        </motion.div>

                        <motion.p
                          className="text-sm text-content-secondary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 }}
                        >
                          ¿Estás seguro de que deseas continuar con la
                          cancelación?
                        </motion.p>

                        {/* Quick summary of what you have */}
                        <motion.div
                          className="rounded-xl bg-accent/5 border border-accent/10 p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.35 }}
                        >
                          <p className="text-xs font-semibold text-content-secondary mb-2.5">
                            Actualmente disfrutas de:
                          </p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {FEATURES_LOSING.slice(0, 4).map((f, idx) => (
                              <motion.div
                                key={f.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  delay: 0.35 + idx * 0.05,
                                  duration: 0.25,
                                }}
                                className="flex items-center gap-1.5 text-xs text-content-secondary"
                              >
                                <CheckCircle2
                                  size={12}
                                  className="text-accent flex-shrink-0"
                                />
                                <span className="truncate">
                                  {f.label.split(" ").slice(0, 2).join(" ")}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      <div className="border-t border-border-subtle px-5 py-4 md:px-6 md:py-5 bg-surface-secondary/50 space-y-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepPlan}
                          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-hover py-3 text-base font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all"
                        >
                          Mantener mi plan GOKAI+
                        </motion.button>
                        <button
                          onClick={() => goTo("losing")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary hover:bg-surface-secondary transition-colors"
                        >
                          Quiero cancelar de todas formas
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 2: Lo que pierdes ── */}
                  {step === "losing" && (
                    <motion.div
                      key="losing"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 px-5 py-5 md:px-6 md:pt-8 md:pb-4 space-y-3">
                        <div className="space-y-1.5">
                          {FEATURES_LOSING.map((f, idx) => (
                            <motion.div
                              key={f.label}
                              initial={{ opacity: 0, x: -20, scale: 0.95 }}
                              animate={{ opacity: 1, x: 0, scale: 1 }}
                              transition={{
                                delay: 0.1 + idx * 0.07,
                                duration: 0.35,
                                ease: "easeOut",
                              }}
                              className="group flex items-center gap-3 rounded-xl p-2.5 bg-red-50/50 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ring-1 ring-red-100/80 dark:ring-red-800/40"
                            >
                              <motion.div
                                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-red-100/80 dark:bg-red-900/40"
                                whileHover={{ rotate: -8 }}
                              >
                                <f.icon size={15} className="text-red-400" />
                              </motion.div>
                              <span className="text-sm text-content-secondary line-through decoration-red-300/70 flex-1">
                                {f.label}
                              </span>
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                  delay: 0.3 + idx * 0.07,
                                  type: "spring" as const,
                                  stiffness: 400,
                                }}
                              >
                                <XCircle size={16} className="text-red-300" />
                              </motion.div>
                            </motion.div>
                          ))}
                        </div>

                        {/* Stat card (solo móvil) */}
                        <motion.div
                          className="md:hidden rounded-xl bg-accent/5 border border-accent/10 p-3.5 text-center"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <Crown
                            size={18}
                            className="mx-auto mb-1.5 text-accent"
                          />
                          <p className="text-xs font-semibold text-content-primary">
                            Tu progreso de aprendizaje se verá afectado
                          </p>
                        </motion.div>
                      </div>

                      <div className="border-t border-border-subtle px-5 py-4 md:px-6 md:py-5 bg-surface-secondary/50 space-y-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepPlan}
                          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-hover py-3 text-base font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all"
                        >
                          ¡Me quedo con GOKAI+!
                        </motion.button>
                        <button
                          onClick={() => goTo("final")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary hover:bg-surface-secondary transition-colors"
                        >
                          Continuar con la cancelación
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ── STEP 3: Confirmación final ── */}
                  {step === "final" && (
                    <motion.div
                      key="final"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 px-5 py-5 md:px-6 md:pt-8 md:pb-4 space-y-4">
                        <motion.div
                          className="rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/50 p-4 text-center"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, duration: 0.35 }}
                        >
                          <p className="text-sm text-red-800 dark:text-red-300 font-medium leading-relaxed">
                            Al confirmar, tu suscripción se cancelará al final
                            del período actual. Regresarás al plan gratuito con
                            funciones limitadas.
                          </p>
                        </motion.div>

                        <motion.div
                          className="rounded-xl bg-surface-secondary border border-border-default p-4 space-y-2.5"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.35 }}
                        >
                          <p className="text-xs font-semibold text-content-secondary">
                            Resumen de la cancelación:
                          </p>
                          <ul className="space-y-1.5">
                            {[
                              {
                                ok: false,
                                text: "Se cancelará la renovación automática",
                              },
                              {
                                ok: false,
                                text: "Perderás acceso a funciones premium",
                              },
                              {
                                ok: true,
                                text: "Tu progreso de aprendizaje se conservará",
                              },
                              {
                                ok: true,
                                text: "Puedes volver a suscribirte cuando quieras",
                              },
                            ].map((item, idx) => (
                              <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{
                                  delay: 0.3 + idx * 0.06,
                                  duration: 0.25,
                                }}
                                className="flex items-center gap-2 text-xs text-content-secondary"
                              >
                                {item.ok ? (
                                  <CheckCircle2
                                    size={14}
                                    className="text-green-500 flex-shrink-0"
                                  />
                                ) : (
                                  <XCircle
                                    size={14}
                                    className="text-red-400 flex-shrink-0"
                                  />
                                )}
                                {item.text}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        {error && (
                          <p className="text-center text-xs text-red-600">
                            {error}
                          </p>
                        )}
                      </div>

                      <div className="border-t border-border-subtle px-5 py-4 md:px-6 md:py-5 bg-surface-secondary/50 space-y-2.5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepPlan}
                          className="w-full rounded-xl bg-gradient-to-r from-accent to-accent-hover py-3 text-base font-bold text-content-inverted shadow-lg shadow-accent/20 transition-all"
                        >
                          No cancelar, mantener GOKAI+
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: loading ? 1 : 1.01 }}
                          whileTap={{ scale: loading ? 1 : 0.99 }}
                          onClick={onConfirmCancel}
                          disabled={loading}
                          className="w-full rounded-xl border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50 hover:border-red-300 dark:hover:border-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg
                                className="h-4 w-4 animate-spin"
                                viewBox="0 0 24 24"
                                fill="none"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                              </svg>
                              Cancelando suscripción...
                            </span>
                          ) : (
                            "Confirmar cancelación definitiva"
                          )}
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
