"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  AlertTriangle,
  ArrowLeft,
  Flame,
  BarChart3,
  BookOpen,
  Bot,
  Crown,
  Sparkles,
  ShieldAlert,
  Trash2,
  CheckCircle2,
  XCircle,
} from "lucide-react";

type DeleteStep = "confirm" | "progress" | "history" | "membership" | "final";

const ACCOUNT_SUMMARY = [
  { icon: Flame, label: "Tu racha y logros de estudio" },
  { icon: BarChart3, label: "Tus estadísticas y avances" },
  { icon: BookOpen, label: "Tus repasos y progreso" },
  { icon: Crown, label: "Tus beneficios premium activos" },
];

const PROGRESS_LOSING = [
  { icon: Flame, label: "Se borrará tu racha actual y tus récords" },
  { icon: BarChart3, label: "Perderás estadísticas, métricas e historial" },
  { icon: BookOpen, label: "Tu progreso en vocabulario, kanji y gramática desaparecerá" },
];

const HISTORY_LOSING = [
  { icon: Bot, label: "Tu historial del chatbot y contexto personalizado" },
  { icon: Sparkles, label: "Tus favoritos, recomendaciones y contenido guardado" },
  { icon: BookOpen, label: "Tus repasos pendientes y rutas de estudio" },
];

const MEMBERSHIP_LOSING = [
  { icon: Crown, label: "Tus beneficios premium y estado de suscripción" },
  { icon: Sparkles, label: "Cualquier personalización asociada a esta cuenta" },
  { icon: ShieldAlert, label: "No habrá forma de restaurar esta cuenta después" },
];

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
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

const STEP_ORDER: DeleteStep[] = [
  "confirm",
  "progress",
  "history",
  "membership",
  "final",
];

const STEP_CONFIG = {
  confirm: {
    gradient: "from-orange-500 to-rose-500",
    icon: AlertTriangle,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "¿Eliminar tu cuenta?",
    subtitle: "Primero revisa todo lo que dejarás atrás",
    statTitle: "Toda tu cuenta actual",
    statCopy: "Se eliminará junto con tu historial, progreso y preferencias.",
    footerLabel: "Cuenta GOKAI activa",
  },
  progress: {
    gradient: "from-red-500 to-orange-500",
    icon: Flame,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "Tu progreso se perderá",
    subtitle: "Todo tu esfuerzo quedará eliminado",
    statTitle: "Racha y métricas",
    statCopy: "No podrás recuperar tus marcas personales ni tu avance histórico.",
    footerLabel: "Progreso acumulado",
  },
  history: {
    gradient: "from-rose-600 to-red-600",
    icon: Bot,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "También perderás tu historial",
    subtitle: "Guardados, recomendaciones y contexto personalizado",
    statTitle: "Contenido personal",
    statCopy: "Tus datos guardados dejarán de existir en esta cuenta.",
    footerLabel: "Datos personalizados",
  },
  membership: {
    gradient: "from-red-700 to-rose-700",
    icon: Crown,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "Tu acceso también termina",
    subtitle: "La cuenta y sus beneficios dejarán de estar disponibles",
    statTitle: "Beneficios y acceso",
    statCopy: "La eliminación también corta cualquier ventaja vinculada a tu perfil.",
    footerLabel: "Acceso de la cuenta",
  },
  final: {
    gradient: "from-stone-800 to-red-900",
    icon: ShieldAlert,
    iconBg: "bg-surface-primary/20",
    iconColor: "text-content-inverted",
    title: "Confirmación final",
    subtitle: "Esta acción es permanente e irreversible",
    statTitle: "Sin vuelta atrás",
    statCopy: "Si sigues, tu cuenta se eliminará definitivamente.",
    footerLabel: "Eliminación permanente",
  },
} as const;

function LossList({
  items,
  tone,
}: {
  items: Array<{ icon: React.ComponentType<{ size?: number; className?: string }>; label: string }>;
  tone: "orange" | "red";
}) {
  const rowClasses =
    tone === "orange"
      ? "bg-orange-50/70 dark:bg-orange-950/20 hover:bg-orange-50 dark:hover:bg-orange-950/30 ring-orange-100/80 dark:ring-orange-800/40"
      : "bg-red-50/60 dark:bg-red-950/20 hover:bg-red-50 dark:hover:bg-red-950/30 ring-red-100/80 dark:ring-red-800/40";
  const iconClasses =
    tone === "orange"
      ? "bg-orange-100/80 dark:bg-orange-900/40 text-orange-500"
      : "bg-red-100/80 dark:bg-red-900/40 text-red-400";
  const strikeDecorationClasses =
    tone === "orange"
      ? "decoration-orange-300/80 dark:decoration-orange-700/70"
      : "decoration-red-300/70 dark:decoration-red-700/70";
  const endIconClasses =
    tone === "orange" ? "text-orange-400 dark:text-orange-500" : "text-red-300 dark:text-red-500";

  return (
    <div className="space-y-1.5">
      {items.map((item, idx) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, x: -20, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{
            delay: 0.1 + idx * 0.07,
            duration: 0.35,
            ease: "easeOut",
          }}
          className={`group flex items-center gap-3 rounded-xl p-2.5 transition-colors ring-1 ${rowClasses}`}
        >
          <motion.div
            className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${iconClasses}`}
            whileHover={{ rotate: -8 }}
          >
            <item.icon size={15} />
          </motion.div>
          <span className={`flex-1 text-sm text-content-secondary line-through ${strikeDecorationClasses}`}>
            {item.label}
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
            <XCircle size={16} className={endIconClasses} />
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirmDelete,
  loading = false,
  error = null,
}: DeleteAccountModalProps) {
  const [step, setStep] = useState<DeleteStep>("confirm");
  const [direction, setDirection] = useState(1);

  const goTo = (next: DeleteStep) => {
    const cur = STEP_ORDER.indexOf(step);
    const nxt = STEP_ORDER.indexOf(next);
    setDirection(nxt > cur ? 1 : -1);
    setStep(next);
  };

  const handleClose = () => {
    setStep("confirm");
    onClose();
  };

  const handleKeepAccount = () => {
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
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative my-4 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-surface-primary shadow-2xl ring-1 ring-border-subtle md:max-w-3xl md:flex-row"
            >
              <motion.div
                className={`relative flex flex-shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br ${cfg.gradient} text-content-inverted md:min-h-[460px] md:w-[320px]`}
                layout
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-surface-primary/10" />
                <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-surface-primary/5" />

                <button
                  onClick={handleClose}
                  className="absolute top-3 right-3 z-10 rounded-full p-1.5 text-white/70 transition-colors hover:bg-surface-primary/10 hover:text-content-inverted md:hidden"
                >
                  <X size={18} />
                </button>

                <div className="relative z-[1] px-6 pt-6 pb-6 md:px-7 md:pt-8 md:pb-0">
                  {step !== "confirm" && (
                    <motion.button
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => {
                        const currentIndex = STEP_ORDER.indexOf(step);
                        goTo(STEP_ORDER[currentIndex - 1]);
                      }}
                      className="mb-4 flex items-center gap-1 text-xs text-white/70 transition-colors hover:text-content-inverted"
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
                          <p className="text-sm text-white/75">{cfg.subtitle}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  <motion.div
                    className="mt-8 hidden items-center gap-2 md:flex"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {STEP_ORDER.map((item, idx) => (
                      <motion.div
                        key={item}
                        className={`h-1.5 rounded-full transition-all duration-400 ${
                          STEP_ORDER.indexOf(step) >= idx
                            ? "bg-surface-primary w-8"
                            : "bg-surface-primary/30 w-4"
                        }`}
                        layout
                      />
                    ))}
                    <span className="ml-2 text-xs text-white/50">
                      Paso {STEP_ORDER.indexOf(step) + 1} de 5
                    </span>
                  </motion.div>

                  <motion.div
                    className="mt-6 hidden rounded-xl bg-surface-primary/10 p-4 backdrop-blur-sm md:block"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                  >
                    <div className="flex items-center gap-3">
                      <Trash2 size={20} className="text-white/80" />
                      <div>
                        <p className="text-sm font-bold">{cfg.statTitle}</p>
                        <p className="text-xs text-white/60">{cfg.statCopy}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  className="hidden items-center gap-2 px-7 pb-6 text-xs text-white/40 md:flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <ShieldAlert size={14} />
                  <span>{cfg.footerLabel}</span>
                </motion.div>
              </motion.div>

              <div className="flex min-w-0 flex-1 flex-col">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 z-10 hidden rounded-full p-1.5 text-content-muted transition-colors hover:bg-surface-tertiary hover:text-content-secondary md:flex"
                >
                  <X size={18} />
                </button>

                <AnimatePresence mode="wait" custom={direction}>
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
                      <div className="flex-1 space-y-4 px-5 py-5 md:px-6 md:pt-8 md:pb-4">
                        <motion.div
                          className="rounded-xl border border-orange-200/80 bg-orange-50 p-4 dark:border-orange-800/50 dark:bg-orange-950/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.15, duration: 0.35 }}
                        >
                          <p className="text-sm font-medium leading-relaxed text-orange-800 dark:text-orange-300">
                            Si eliminas tu cuenta, borraremos tu perfil, tu progreso y cualquier dato asociado.
                            Antes de continuar, te mostraremos exactamente qué vas a perder.
                          </p>
                        </motion.div>

                        <motion.p
                          className="text-sm text-content-secondary"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 }}
                        >
                          Esta decisión afecta todo tu historial dentro de GOKAI, no solo tu acceso actual.
                        </motion.p>

                        <motion.div
                          className="rounded-2xl border border-orange-200/70 bg-gradient-to-br from-orange-50 via-amber-50/80 to-white p-4 shadow-sm dark:border-orange-800/50 dark:from-orange-950/35 dark:via-red-950/10 dark:to-surface-primary dark:shadow-none"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3, duration: 0.35 }}
                        >
                          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 dark:text-orange-300">
                            Tu cuenta hoy conserva:
                          </p>
                          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {ACCOUNT_SUMMARY.map((item, idx) => (
                              <motion.div
                                key={item.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  delay: 0.35 + idx * 0.05,
                                  duration: 0.25,
                                }}
                                className="flex items-center gap-2 rounded-xl border border-orange-200/70 bg-white/80 px-3 py-2 text-xs text-content-primary shadow-sm dark:border-orange-800/50 dark:bg-white/5 dark:text-content-primary dark:shadow-none"
                              >
                                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
                                  <item.icon size={14} />
                                </div>
                                <span className="truncate font-medium">{item.label}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-2.5 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 md:px-6 md:py-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepAccount}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-content-inverted shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          Quiero conservar mi cuenta
                        </motion.button>
                        <button
                          onClick={() => goTo("progress")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary transition-colors hover:bg-surface-secondary"
                        >
                          Mostrar lo que se eliminará
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "progress" && (
                    <motion.div
                      key="progress"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 space-y-3 px-5 py-5 md:px-6 md:pt-8 md:pb-4">
                        <LossList items={PROGRESS_LOSING} tone="orange" />

                        <motion.div
                          className="rounded-xl border border-orange-200/60 bg-orange-50/70 p-3.5 text-center dark:border-orange-800/50 dark:bg-orange-950/25 md:hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <Flame size={18} className="mx-auto mb-1.5 text-orange-500 dark:text-orange-300" />
                          <p className="text-xs font-semibold text-content-primary dark:text-content-primary">
                            Todo tu esfuerzo acumulado en estudio se reiniciará.
                          </p>
                        </motion.div>
                      </div>

                      <div className="space-y-2.5 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 md:px-6 md:py-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepAccount}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-content-inverted shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          No, conservar mi progreso
                        </motion.button>
                        <button
                          onClick={() => goTo("history")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary transition-colors hover:bg-surface-secondary"
                        >
                          Continuar
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "history" && (
                    <motion.div
                      key="history"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 space-y-3 px-5 py-5 md:px-6 md:pt-8 md:pb-4">
                        <LossList items={HISTORY_LOSING} tone="red" />

                        <motion.div
                          className="rounded-xl border border-red-200/60 bg-red-50/70 p-3.5 text-center dark:border-red-800/50 dark:bg-red-950/25 md:hidden"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.45 }}
                        >
                          <Bot size={18} className="mx-auto mb-1.5 text-red-400 dark:text-red-300" />
                          <p className="text-xs font-semibold text-content-primary dark:text-content-primary">
                            También perderás tu historial personalizado y contenido guardado.
                          </p>
                        </motion.div>
                      </div>

                      <div className="space-y-2.5 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 md:px-6 md:py-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepAccount}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-content-inverted shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          Quiero conservar mis datos
                        </motion.button>
                        <button
                          onClick={() => goTo("membership")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary transition-colors hover:bg-surface-secondary"
                        >
                          Seguir revisando
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "membership" && (
                    <motion.div
                      key="membership"
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex flex-1 flex-col"
                    >
                      <div className="flex-1 space-y-3 px-5 py-5 md:px-6 md:pt-8 md:pb-4">
                        <LossList items={MEMBERSHIP_LOSING} tone="red" />

                        <motion.div
                          className="rounded-xl border border-red-200/80 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4, duration: 0.35 }}
                        >
                          <p className="text-sm font-medium leading-relaxed text-red-800 dark:text-red-300">
                            Eliminar la cuenta no solo cierra tu sesión: elimina la identidad completa que usas en GOKAI.
                          </p>
                        </motion.div>
                      </div>

                      <div className="space-y-2.5 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 md:px-6 md:py-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepAccount}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-content-inverted shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          Mantener mi cuenta activa
                        </motion.button>
                        <button
                          onClick={() => goTo("final")}
                          className="w-full rounded-xl border border-border-default py-2.5 text-sm font-medium text-content-tertiary transition-colors hover:bg-surface-secondary"
                        >
                          Ir a la confirmación final
                        </button>
                      </div>
                    </motion.div>
                  )}

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
                      <div className="flex-1 space-y-4 px-5 py-5 md:px-6 md:pt-8 md:pb-4">
                        <motion.div
                          className="rounded-xl border border-red-200/80 bg-red-50 p-4 text-center dark:border-red-800/50 dark:bg-red-950/30"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, duration: 0.35 }}
                        >
                          <p className="text-sm font-medium leading-relaxed text-red-800 dark:text-red-300">
                            Al confirmar, tu cuenta y todos sus datos se eliminarán de forma permanente.
                            Si vuelves en el futuro, tendrías que empezar desde cero.
                          </p>
                        </motion.div>

                        <motion.div
                          className="space-y-2.5 rounded-xl border border-border-default bg-surface-secondary p-4"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2, duration: 0.35 }}
                        >
                          <p className="text-xs font-semibold text-content-secondary">
                            Resumen de la eliminación:
                          </p>
                          <ul className="space-y-1.5">
                            {[
                              {
                                ok: false,
                                text: "Se borrarán tus datos personales y de estudio",
                              },
                              {
                                ok: false,
                                text: "Perderás racha, progreso, favoritos e historial",
                              },
                              {
                                ok: false,
                                text: "Tu acceso premium asociado a esta cuenta terminará",
                              },
                              {
                                ok: true,
                                text: "Podrás crear otra cuenta en el futuro, pero desde cero",
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
                                    className="flex-shrink-0 text-green-500"
                                  />
                                ) : (
                                  <XCircle
                                    size={14}
                                    className="flex-shrink-0 text-red-400"
                                  />
                                )}
                                {item.text}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>

                        {error && (
                          <p className="text-center text-xs text-red-600 dark:text-red-400">{error}</p>
                        )}
                      </div>

                      <div className="space-y-2.5 border-t border-border-subtle bg-surface-secondary/50 px-5 py-4 md:px-6 md:py-5">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleKeepAccount}
                          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-base font-bold text-content-inverted shadow-lg shadow-emerald-500/20 transition-all"
                        >
                          Cancelar eliminación y conservar mi cuenta
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: loading ? 1 : 1.01 }}
                          whileTap={{ scale: loading ? 1 : 0.99 }}
                          onClick={onConfirmDelete}
                          disabled={loading}
                          className="w-full rounded-xl border-2 border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400 dark:hover:border-red-700 dark:hover:bg-red-950/50"
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
                              Eliminando cuenta...
                            </span>
                          ) : (
                            "Eliminar cuenta y borrar mis datos"
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