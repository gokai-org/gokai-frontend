"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Sparkles,
  Bot,
  BarChart3,
  Network,
  BookOpen,
  Zap,
  Shield,
  Crown,
  CheckCircle2,
} from "lucide-react";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";

const PLAN_FEATURES = [
  {
    icon: Bot,
    title: "Chatbot ilimitado",
    description:
      "Practica conversación con IA sin restricciones, las 24 horas.",
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
    description:
      "Lecciones que se adaptan a tu nivel y velocidad de aprendizaje.",
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

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const STRIPE_PRICE_ID =
    process.env.NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID ??
    process.env.SUBSCRIPTION_PRICE_ID;

  async function claimCoupon(
    code: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch("/api/subscription/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.success === false) {
        return {
          success: false,
          error: data.error || "No se pudo aplicar el cupón.",
        };
      }

      return { success: true };
    } catch {
      return { success: false, error: "Error de red. Inténtalo de nuevo." };
    }
  }

  async function handleApplyCoupon() {
    const code = coupon.trim();
    if (!code) return;

    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);
    setError(null);

    const result = await claimCoupon(code);
    if (!result.success) {
      setCouponError(result.error || "No se pudo aplicar el cupón.");
      setCouponLoading(false);
      return;
    }

    setCouponSuccess(
      "Cupón aplicado correctamente. Tu suscripción ya está activa.",
    );
    setCoupon("");
    setCouponLoading(false);
    window.location.href = "/checkout/success";
  }

  async function handleCheckout() {
    setLoading(true);
    setError(null);
    setCouponError(null);

    const couponCode = coupon.trim();
    if (couponCode) {
      const result = await claimCoupon(couponCode);
      if (!result.success) {
        setCouponError(result.error || "No se pudo aplicar el cupón.");
        setLoading(false);
        return;
      }
      window.location.href = "/checkout/success";
      return;
    }

    if (!STRIPE_PRICE_ID) {
      setError("Error de configuración: falta el identificador de precio.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/subscription/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: STRIPE_PRICE_ID,
          successUrl: `${window.location.origin}/checkout/success`,
        }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Error al iniciar el pago.");
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50">
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-white/30" />

      {/* Centrado vertical + horizontal, scroll solo si el viewport es muy pequeño */}
      <div className="relative z-10 flex min-h-screen items-center justify-center overflow-y-auto px-4 py-8 sm:px-6 sm:py-12">
        <motion.div
          className="w-full max-w-lg md:max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Card — horizontal desktop, vertical móvil */}
          <div className="overflow-hidden rounded-2xl bg-white/95 shadow-xl ring-1 ring-black/5 backdrop-blur flex flex-col md:flex-row">
            {/* ═══ PANEL IZQUIERDO — Gradiente + info ═══ */}
            <div className="relative flex flex-col justify-between bg-gradient-to-br from-[#993331] to-[#BA5149] text-white overflow-hidden md:w-[340px] md:min-h-[480px] flex-shrink-0">
              {/* Decoración */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -left-6 bottom-8 h-20 w-20 rounded-full bg-white/5" />
              <div className="pointer-events-none absolute right-4 bottom-4 h-14 w-14 rounded-full bg-white/5" />

              <div className="relative z-[1] px-6 pt-6 pb-6 md:pb-0 md:pt-8 md:px-7">
                {/* Logo + badge */}
                <div className="flex flex-col items-center md:items-start">
                  <a href="/" className="inline-block">
                    <motion.div
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Image
                        src="/logos/gokai-logo.svg"
                        alt="Gokai"
                        width={48}
                        height={48}
                        priority
                      />
                    </motion.div>
                  </a>

                  <motion.span
                    className="mt-3 inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={ready ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.15, duration: 0.4 }}
                  >
                    Paso 2 de 2
                  </motion.span>
                </div>

                <motion.div
                  className="mt-4 flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={ready ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Crown size={24} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold tracking-tight">
                      GOKAI+
                    </h1>
                    <p className="text-sm text-white/80">
                      Desbloquea todo tu potencial
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  className="mt-5 flex items-baseline gap-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={ready ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <span className="text-4xl font-extrabold">$229</span>
                  <span className="text-sm text-white/60">MXN / mes</span>
                </motion.div>

                {/* Features compactas (solo desktop) */}
                <motion.div
                  className="mt-6 hidden md:block space-y-2.5"
                  initial={{ opacity: 0 }}
                  animate={ready ? { opacity: 1 } : {}}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  {PLAN_FEATURES.map((f, idx) => (
                    <motion.div
                      key={f.title}
                      initial={{ opacity: 0, x: -12 }}
                      animate={ready ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.3 + idx * 0.06, duration: 0.3 }}
                      className="flex items-center gap-2.5"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-white/70 flex-shrink-0"
                      />
                      <span className="text-sm text-white/90">{f.title}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Sello seguridad (solo desktop) */}
              <motion.div
                className="hidden md:flex items-center gap-3 px-7 pb-6 text-white/50 text-xs"
                initial={{ opacity: 0 }}
                animate={ready ? { opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.3 }}
              >
                <Shield size={14} />
                <span>Pago seguro · Powered by Stripe</span>
              </motion.div>
            </div>

            {/* ═══ PANEL DERECHO — Features detalladas + CTA ═══ */}
            <div className="flex flex-1 flex-col min-w-0">
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
                      animate={ready ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.15 + idx * 0.06, duration: 0.35 }}
                      className="flex items-start gap-3 rounded-xl p-2 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#993331]/10">
                        <feature.icon size={16} className="text-[#993331]" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {feature.title}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cupón + CTA */}
              <div className="border-t border-gray-100 px-5 py-4 md:px-6 md:py-5 space-y-3 bg-gray-50/50">
                {/* Cupón */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    ¿Tienes un cupón?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Código de cupón"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#993331]/30 focus:border-[#993331]/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !coupon.trim()}
                      className="rounded-lg bg-[#993331]/10 px-4 py-2 text-sm font-semibold text-[#993331] hover:bg-[#993331]/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {couponLoading ? "Aplicando..." : "Aplicar"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="mt-1 text-xs text-red-600">{couponError}</p>
                  )}
                  {couponSuccess && (
                    <p className="mt-1 text-xs text-emerald-600">
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Total hoy
                  </span>
                  <span className="text-lg font-extrabold text-gray-900">
                    $229 MXN
                  </span>
                </div>

                {/* CTA */}
                <motion.button
                  type="button"
                  disabled={loading}
                  onClick={handleCheckout}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full rounded-xl bg-gradient-to-r from-[#993331] to-[#BA5149] py-3.5 text-base font-bold text-white shadow-lg shadow-[#993331]/20 transition-all hover:shadow-xl hover:shadow-[#993331]/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin"
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
                      Redirigiendo a Stripe...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {coupon.trim()
                        ? "Aplicar cupón y activar GOKAI+"
                        : "Suscribirme a GOKAI+"}
                    </span>
                  )}
                </motion.button>

                {error && (
                  <p className="text-center text-sm text-red-600">{error}</p>
                )}

                <p className="text-center text-xs text-gray-400">
                  Serás redirigido a Stripe para completar el pago de forma
                  segura.
                  <br />
                  Puedes cancelar en cualquier momento.
                </p>

                {/* Skip */}
                <div className="border-t border-gray-100 pt-3 text-center">
                  <a
                    href="/onboarding/interests"
                    className="text-sm font-medium text-gray-400 transition hover:text-gray-600"
                  >
                    Continuar con plan gratuito →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Security badges (solo móvil) */}
          <motion.div
            className="mt-5 flex md:hidden items-center justify-center gap-4 text-xs text-neutral-400"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            <span className="flex items-center gap-1">
              <Shield size={14} />
              Pago seguro con SSL
            </span>
            <span>·</span>
            <span>Powered by Stripe</span>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
}
