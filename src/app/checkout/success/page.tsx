"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  Bot,
  BarChart3,
  Network,
  BookOpen,
  Zap,
  CheckCircle2,
} from "lucide-react";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";

const UNLOCKED_FEATURES = [
  { icon: Bot, label: "Chatbot ilimitado con IA" },
  { icon: BarChart3, label: "Estadísticas avanzadas" },
  { icon: Network, label: "Grafo completo de kanji" },
  { icon: Sparkles, label: "IA completa y adaptativa" },
  { icon: BookOpen, label: "Repasos inteligentes" },
  { icon: Zap, label: "Acceso anticipado" },
];

export default function CheckoutSuccessPage() {
  const [phase, setPhase] = useState<"unlocking" | "features" | "ready">("unlocking");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("features"), 4200);
    const t2 = setTimeout(() => setPhase("ready"), 9000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function handleContinue() {
    window.location.replace("/dashboard/graph");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50">
      <AnimatedGraphBackground />

      <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-white/30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">

          {/* PHASE 1 */}
          {phase === "unlocking" && (
            <motion.div
              key="unlocking"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            >

              <div className="relative">

                {/* BIG PULSE */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-[#993331]/20"
                  animate={{
                    scale: [1, 2.6, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ width: 140, height: 140, top: -20, left: -20 }}
                />

                {/* ROTATING CROWN */}
                <motion.div
                  className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#993331] to-[#BA5149] shadow-2xl shadow-[#993331]/40"
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.12, 1],
                  }}
                  transition={{
                    rotate: {
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    },
                    scale: {
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <Crown size={40} className="text-white" />
                </motion.div>
              </div>

              <motion.h1
                className="mt-10 text-2xl sm:text-3xl font-extrabold text-gray-900"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 1.2 }}
              >
                Desbloqueando GOKAI+
              </motion.h1>

              <motion.p
                className="mt-2 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.4 }}
              >
                Preparando tu experiencia premium...
              </motion.p>

              {/* Loading dots */}
              <motion.div
                className="mt-8 flex gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full bg-[#993331]"
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.3, 1, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.35,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* PHASE 2 */}
          {phase === "features" && (
            <motion.div
              key="features"
              className="flex flex-col items-center text-center w-full max-w-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 14,
                  stiffness: 120,
                  duration: 1.4,
                }}
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#993331] to-[#BA5149] shadow-xl shadow-[#993331]/30">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
              </motion.div>

              <motion.h1
                className="mt-6 text-3xl font-extrabold text-gray-900"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 1.2 }}
              >
                ¡Pago exitoso!
              </motion.h1>

              <motion.p
                className="mt-2 text-sm text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.6 }}
              >
                Esto es todo lo que acabas de desbloquear
              </motion.p>

              {/* FEATURES */}
              <div className="mt-8 w-full space-y-3">
                {UNLOCKED_FEATURES.map((f, idx) => (
                  <motion.div
                    key={f.label}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 1 + idx * 0.25,
                      duration: 1.2,
                      ease: "circOut",
                    }}
                    className="flex items-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm p-3 ring-1 ring-black/5 shadow-sm"
                  >
                    <motion.div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#993331]/10"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 1.2 + idx * 0.25,
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                      }}
                    >
                      <f.icon size={18} className="text-[#993331]" />
                    </motion.div>

                    <span className="text-sm font-medium text-gray-800">
                      {f.label}
                    </span>

                    <motion.div
                      className="ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 1.4 + idx * 0.25,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <CheckCircle2 size={18} className="text-green-500" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PHASE 3 */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              className="flex flex-col items-center text-center w-full max-w-md"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 14,
                  stiffness: 120,
                }}
              >
                <Image
                  src="/logos/gokai-logo.svg"
                  alt="Gokai"
                  width={90}
                  height={90}
                  priority
                />
              </motion.div>

              <motion.div
                className="mt-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 1.6 }}
              >
                <span className="rounded-full bg-[#993331]/10 px-3 py-1 text-xs font-bold text-[#993331]">
                  GOKAI+ Activo
                </span>
              </motion.div>

              <motion.h1
                className="mt-5 text-4xl font-extrabold text-gray-900"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 1.4 }}
              >
                ¡Todo listo!
              </motion.h1>

              <motion.p
                className="mt-3 text-base text-gray-500 max-w-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.4 }}
              >
                Tu suscripción GOKAI+ está activa. Todas las funciones premium han sido desbloqueadas.
              </motion.p>

              <motion.button
                onClick={handleContinue}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.6, duration: 1.2 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="mt-10 w-full max-w-xs rounded-xl bg-gradient-to-r from-[#993331] to-[#BA5149] py-3.5 text-base font-bold text-white shadow-lg shadow-[#993331]/25 hover:shadow-xl hover:shadow-[#993331]/40"
              >
                Comenzar a aprender
              </motion.button>

              <motion.p
                className="mt-4 text-xs text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
              >
                Serás redirigido al panel principal
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}