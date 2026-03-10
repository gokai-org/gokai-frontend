"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Bot, BarChart3, Network, BookOpen, Zap, Crown, CheckCircle2, Shield } from "lucide-react";

const PLAN_FEATURES = [
  {
    icon: Bot,
    title: "Chatbot ilimitado",
    description: "Practica conversación con IA sin restricciones, las 24 horas.",
  },
  {
    icon: BarChart3,
    title: "Estadísticas avanzadas",
    description: "Reportes detallados de tu progreso y áreas de mejora.",
  },
  {
    icon: Network,
    title: "Grafo completo de kanji",
    description: "Explora las conexiones entre todos los kanji sin límites.",
  },
  {
    icon: Sparkles,
    title: "IA completa y adaptativa",
    description: "Lecciones que se adaptan a tu nivel y velocidad de aprendizaje.",
  },
  {
    icon: BookOpen,
    title: "Repasos inteligentes",
    description: "Sistema de repetición espaciada optimizado con IA.",
  },
  {
    icon: Zap,
    title: "Acceso anticipado",
    description: "Sé el primero en probar nuevas funcionalidades.",
  },
];

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  loading?: boolean;
  error?: string | null;
  coupon?: string;
  onCouponChange?: (value: string) => void;
  onApplyCoupon?: () => void;
  couponLoading?: boolean;
  couponError?: string | null;
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

export function UpgradePlanModal({
  isOpen,
  onClose,
  onUpgrade,
  loading = false,
  error = null,
  coupon = "",
  onCouponChange,
  onApplyCoupon,
  couponLoading = false,
  couponError = null,
}: UpgradePlanModalProps) {
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
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Scroll container */}
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            {/* Modal — horizontal en desktop, vertical en móvil */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative w-full max-w-lg md:max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 my-4 flex flex-col md:flex-row"
            >
              {/* ═══ PANEL IZQUIERDO — Gradiente + info ═══ */}
              <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#993331] to-[#BA5149] text-white overflow-hidden md:w-[340px] md:min-h-[480px] flex-shrink-0">
                {/* Elementos decorativos */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-white/5" />
                <div className="pointer-events-none absolute right-4 bottom-4 h-14 w-14 rounded-full bg-white/5" />

                {/* Cerrar solo visible en móvil */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 md:hidden rounded-full p-1.5 text-white/70 hover:text-white hover:bg-white/10 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                <div className="relative z-[1] px-6 pt-6 pb-6 md:pb-0 md:pt-8 md:px-7">
                  <motion.div
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <Crown size={24} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight">GOKAI+</h2>
                      <p className="text-sm text-white/80">Desbloquea todo tu potencial</p>
                    </div>
                  </motion.div>

                  <motion.div
                    className="mt-5 flex items-baseline gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <span className="text-4xl font-extrabold">$229</span>
                    <span className="text-sm text-white/60">MXN / mes</span>
                  </motion.div>

                  {/* Features compactas en panel izq (solo desktop) */}
                  <motion.div
                    className="mt-6 hidden md:block space-y-2.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                  >
                    {PLAN_FEATURES.map((f, idx) => (
                      <motion.div
                        key={f.title}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.06, duration: 0.3 }}
                        className="flex items-center gap-2.5"
                      >
                        <CheckCircle2 size={15} className="text-white/70 flex-shrink-0" />
                        <span className="text-sm text-white/90">{f.title}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>

                {/* Sello seguridad (solo desktop) */}
                <motion.div
                  className="hidden md:flex items-center gap-3 px-7 pb-6 text-white/50 text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                >
                  <Shield size={14} />
                  <span>Pago seguro · Powered by Stripe</span>
                </motion.div>
              </div>

              {/* ═══ PANEL DERECHO — Features detalladas + CTA ═══ */}
              <div className="flex flex-1 flex-col min-w-0">
                {/* Cerrar (solo desktop) */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 hidden md:flex rounded-full p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
                >
                  <X size={18} />
                </button>

                {/* Features detalladas */}
                <div className="px-5 py-5 md:px-6 md:pt-6 md:pb-4 flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Todo lo que incluye GOKAI+:
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {PLAN_FEATURES.map((feature, idx) => (
                      <motion.div
                        key={feature.title}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + idx * 0.06, duration: 0.35 }}
                        className="flex items-start gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#993331]/10">
                          <feature.icon size={16} className="text-[#993331]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{feature.title}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Cupón + CTA */}
                <div className="border-t border-gray-100 px-5 py-4 md:px-6 md:py-5 space-y-3 bg-gray-50/50">
                  {/* Cupón */}
                  {onCouponChange && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        ¿Tienes un cupón?
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={coupon}
                          onChange={(e) => onCouponChange(e.target.value)}
                          placeholder="Código de cupón"
                          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#993331]/30 focus:border-[#993331]/40 transition-all"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={onApplyCoupon}
                          disabled={couponLoading || !coupon.trim()}
                          className="rounded-lg bg-[#993331]/10 px-4 py-2 text-sm font-semibold text-[#993331] hover:bg-[#993331]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {couponLoading ? "..." : "Aplicar"}
                        </motion.button>
                      </div>
                      {couponError && (
                        <p className="mt-1 text-xs text-red-600">{couponError}</p>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                    onClick={onUpgrade}
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-[#993331] to-[#BA5149] py-3.5 text-base font-bold text-white shadow-lg shadow-[#993331]/20 transition-all hover:shadow-xl hover:shadow-[#993331]/30 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Redirigiendo a Stripe...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Suscribirme a GOKAI+
                      </span>
                    )}
                  </motion.button>

                  {error && <p className="text-center text-xs text-red-600">{error}</p>}

                  <p className="text-center text-xs text-gray-400">
                    Pago seguro con Stripe · Cancela cuando quieras
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
