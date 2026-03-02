"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  async function handleCheckout() {
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      window.location.replace("/onboarding/interests");
    } catch {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50">
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-white/30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={ready ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Card */}
          <div className="rounded-2xl bg-white/95 p-8 shadow-xl ring-1 ring-black/5 backdrop-blur">
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <a href="/" className="inline-block">
                <motion.div
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Image src="/logos/gokai-logo.svg" alt="Gokai" width={64} height={64} priority />
                </motion.div>
              </a>

              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center rounded-full bg-[#993331]/10 px-3 py-1 text-xs font-bold text-[#993331]">
                  Paso 2 de 3
                </span>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight text-neutral-900">
                Activa tu suscripción <span className="text-[#993331]">GOKAI+</span>
              </h1>
              <p className="mt-2 text-sm text-neutral-500">
                Desbloquea todo el potencial de la IA para aprender japonés.
              </p>
            </div>

            {/* Plan summary */}
            <div className="mt-8 rounded-xl bg-neutral-50 p-5 ring-1 ring-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">GOKAI+ Mensual</p>
                  <p className="mt-0.5 text-xs text-neutral-500">Facturación mensual</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold tracking-tight text-neutral-900">$199</p>
                  <p className="text-xs text-neutral-400">MXN / mes</p>
                </div>
              </div>

              <div className="mt-4 border-t border-neutral-200 pt-4">
                <ul className="space-y-2 text-sm text-neutral-700">
                  <li className="flex items-center gap-2">
                    <span className="text-[#993331] font-bold">✓</span>
                    IA completa y adaptativa
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#993331] font-bold">✓</span>
                    Chatbot ilimitado
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#993331] font-bold">✓</span>
                    Estadísticas avanzadas
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[#993331] font-bold">✓</span>
                    Grafo completo de kanji
                  </li>
                </ul>
              </div>
            </div>

            {/* Total */}
            <div className="mt-6 flex items-center justify-between px-1">
              <span className="text-sm font-semibold text-neutral-700">Total hoy</span>
              <span className="text-lg font-extrabold text-neutral-900">$199 MXN</span>
            </div>

            {/* CTA */}
            <motion.button
              type="button"
              disabled={loading}
              onClick={handleCheckout}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="mt-6 w-full rounded-xl bg-[#993331] py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                "Suscribirme a GOKAI+"
              )}
            </motion.button>

            <p className="mt-4 text-center text-xs text-neutral-400">
              Serás redirigido a Stripe para completar el pago de forma segura.
              <br />
              Puedes cancelar en cualquier momento.
            </p>

            {/* Skip / go free */}
            <div className="mt-6 border-t border-neutral-100 pt-5 text-center">
              <a
                href="/onboarding/interests"
                className="text-sm font-medium text-neutral-500 transition hover:text-neutral-700"
              >
                Continuar con plan gratuito →
              </a>
            </div>
          </div>

          {/* Security badges */}
          <motion.div
            className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400"
            initial={{ opacity: 0 }}
            animate={ready ? { opacity: 1 } : {}}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
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
