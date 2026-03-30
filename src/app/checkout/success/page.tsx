"use client";

import { useEffect, useMemo, useState } from "react";
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

type Phase = "unlocking" | "features" | "ready";

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        size: 6 + (i % 4) * 4,
        left: `${6 + ((i * 7) % 88)}%`,
        top: `${8 + ((i * 11) % 80)}%`,
        duration: 8 + (i % 5) * 2,
        delay: i * 0.35,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-accent/10 blur-[1px]"
          style={{
            width: p.size,
            height: p.size,
            left: p.left,
            top: p.top,
          }}
          animate={{
            y: [0, -18, 0, 14, 0],
            x: [0, 8, -6, 4, 0],
            opacity: [0.15, 0.5, 0.2, 0.45, 0.15],
            scale: [1, 1.15, 0.95, 1.1, 1],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}

function OrbitalRings() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute h-[240px] w-[240px] rounded-full border border-accent/10"
        animate={{ rotate: 360, scale: [1, 1.03, 1] }}
        transition={{
          rotate: { duration: 24, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute h-[320px] w-[320px] rounded-full border border-accent-hover/10"
        animate={{ rotate: -360, scale: [1, 1.04, 1] }}
        transition={{
          rotate: { duration: 34, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute h-[420px] w-[420px] rounded-full border border-accent/5"
        animate={{ rotate: 360 }}
        transition={{
          duration: 42,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}

function PremiumGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="absolute h-[520px] w-[520px] rounded-full bg-accent/10 blur-3xl"
        animate={{
          scale: [1, 1.08, 0.98, 1],
          opacity: [0.22, 0.32, 0.2, 0.22],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute h-[300px] w-[300px] rounded-full bg-accent-hover/10 blur-3xl"
        animate={{
          scale: [1, 1.16, 1],
          opacity: [0.18, 0.3, 0.18],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  const [phase, setPhase] = useState<Phase>("unlocking");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("features"), 5200);
    const t2 = setTimeout(() => setPhase("ready"), 11200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function handleContinue() {
    window.location.replace("/dashboard/graph");
  }

  return (
    <div className="force-light">
    <main className="relative min-h-screen overflow-hidden bg-surface-secondary">
      <AnimatedGraphBackground />
      <PremiumGlow />
      <OrbitalRings />
      <FloatingParticles />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(255,255,255,0.72)_35%,rgba(255,255,255,0.88)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-surface-primary/40 via-surface-primary/20 to-surface-primary/50" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait">
          {phase === "unlocking" && (
            <motion.div
              key="unlocking"
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, filter: "blur(6px)" }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            >
              <div className="relative flex items-center justify-center">
                <motion.div
                  className="absolute h-[180px] w-[180px] rounded-full bg-accent/12 blur-2xl"
                  animate={{
                    scale: [1, 1.24, 1],
                    opacity: [0.35, 0.6, 0.35],
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.div
                  className="absolute h-[140px] w-[140px] rounded-full border border-accent/15"
                  animate={{
                    scale: [1, 1.35],
                    opacity: [0.7, 0],
                  }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                />

                <motion.div
                  className="absolute h-[140px] w-[140px] rounded-full border border-accent-hover/20"
                  animate={{
                    scale: [1, 1.5],
                    opacity: [0.55, 0],
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: 1,
                  }}
                />

                <motion.div
                  className="absolute h-[220px] w-[220px] rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <motion.div
                    className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-accent-hover/55 shadow-[0_0_20px_rgba(186,81,73,0.45)]"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </motion.div>

                <motion.div
                  className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-accent via-[#A83F3A] to-accent-hover shadow-[0_20px_80px_rgba(153,51,49,0.35)]"
                  animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 6, -6, 0],
                  }}
                  transition={{
                    scale: {
                      duration: 4.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                    rotate: {
                      duration: 7,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full border border-white/20"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 14,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                  <motion.div
                    animate={{
                      y: [0, -3, 0],
                      scale: [1, 1.04, 1],
                    }}
                    transition={{
                      duration: 3.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Crown size={46} className="text-content-inverted" />
                  </motion.div>
                </motion.div>
              </div>

              <motion.h1
                className="mt-10 text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 1.2, ease: "easeOut" }}
              >
                Desbloqueando GOKAI+
              </motion.h1>

              <motion.p
                className="mt-3 max-w-sm text-sm leading-relaxed text-content-tertiary sm:text-base"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.95, duration: 1.4, ease: "easeOut" }}
              >
                Estamos activando tu experiencia premium, preparando
                herramientas avanzadas y sincronizando tus beneficios
                exclusivos.
              </motion.p>

              <motion.div
                className="mt-8 flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full bg-accent shadow-[0_0_16px_rgba(153,51,49,0.25)]"
                    animate={{
                      y: [0, -8, 0],
                      scale: [1, 1.55, 1],
                      opacity: [0.28, 1, 0.28],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.32,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}

          {phase === "features" && (
            <motion.div
              key="features"
              className="flex w-full max-w-xl flex-col items-center text-center"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              <motion.div
                className="relative"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  damping: 16,
                  stiffness: 110,
                  duration: 1.6,
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/15 blur-2xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.35, 0.65, 0.35],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-hover shadow-[0_18px_60px_rgba(153,51,49,0.28)]">
                  <CheckCircle2 size={44} className="text-content-inverted" />
                </div>
              </motion.div>

              <motion.h1
                className="mt-7 text-3xl font-extrabold tracking-tight text-content-primary sm:text-4xl"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 1.2 }}
              >
                ¡Pago exitoso!
              </motion.h1>

              <motion.p
                className="mt-3 max-w-md text-sm text-content-tertiary sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75, duration: 1.5 }}
              >
                Estas son las funciones premium que acabas de desbloquear en tu
                cuenta:
              </motion.p>

              <div className="mt-8 w-full space-y-3">
                {UNLOCKED_FEATURES.map((feature, idx) => (
                  <motion.div
                    key={feature.label}
                    className="group relative overflow-hidden rounded-2xl border border-white/60 bg-surface-primary/75 p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl"
                    initial={{ opacity: 0, y: 26, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: 1 + idx * 0.22,
                      duration: 1.1,
                      ease: "easeOut",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent/[0.04] via-transparent to-accent-hover/[0.05]"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 5.5,
                        repeat: Infinity,
                        ease: "linear",
                        delay: idx * 0.35,
                      }}
                    />

                    <div className="relative flex items-center gap-3">
                      <motion.div
                        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10"
                        initial={{ scale: 0, rotate: -18 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 1.15 + idx * 0.22,
                          type: "spring",
                          damping: 14,
                          stiffness: 180,
                        }}
                      >
                        <feature.icon size={20} className="text-accent" />
                      </motion.div>

                      <div className="flex-1 text-left">
                        <span className="block text-sm font-semibold text-content-primary sm:text-[15px]">
                          {feature.label}
                        </span>
                      </div>

                      <motion.div
                        className="ml-auto"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 1.28 + idx * 0.22,
                          type: "spring",
                          damping: 12,
                          stiffness: 220,
                        }}
                      >
                        <CheckCircle2 size={20} className="text-green-500" />
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {phase === "ready" && (
            <motion.div
              key="ready"
              className="flex w-full max-w-md flex-col items-center text-center"
              initial={{ opacity: 0, y: 34, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1.7, ease: "easeOut" }}
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.65 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  damping: 15,
                  stiffness: 110,
                  duration: 1.6,
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/12 blur-2xl"
                  animate={{
                    scale: [1, 1.18, 1],
                    opacity: [0.28, 0.52, 0.28],
                  }}
                  transition={{
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 1.5, -1.5, 0],
                  }}
                  transition={{
                    duration: 5.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/logos/gokai-logo.svg"
                    alt="Gokai"
                    width={92}
                    height={92}
                    priority
                  />
                </motion.div>
              </motion.div>

              <motion.div
                className="mt-5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 1.1 }}
              >
                <motion.span
                  className="inline-flex items-center gap-2 rounded-full border border-accent/10 bg-surface-primary/80 px-4 py-2 text-xs font-bold text-accent shadow-sm backdrop-blur-md"
                  animate={{
                    y: [0, -2, 0],
                    boxShadow: [
                      "0 6px 20px rgba(153,51,49,0.08)",
                      "0 10px 28px rgba(153,51,49,0.14)",
                      "0 6px 20px rgba(153,51,49,0.08)",
                    ],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  GOKAI+ Activo
                </motion.span>
              </motion.div>

              <motion.h1
                className="mt-5 text-4xl font-extrabold tracking-tight text-content-primary sm:text-5xl"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75, duration: 1.2 }}
              >
                ¡Todo listo!
              </motion.h1>

              <motion.p
                className="mt-3 max-w-sm text-sm leading-relaxed text-content-tertiary sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 1.3 }}
              >
                Tu suscripción GOKAI+ está activa y todas las funciones premium
                ya fueron desbloqueadas para tu aprendizaje.
              </motion.p>

              <motion.button
                onClick={handleContinue}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.45, duration: 1.2 }}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                  boxShadow: "0 20px 45px rgba(153,51,49,0.28)",
                }}
                whileTap={{ scale: 0.985 }}
                className="mt-10 w-full max-w-xs rounded-2xl bg-gradient-to-r from-accent via-[#A83F3A] to-accent-hover py-4 text-base font-bold text-content-inverted shadow-[0_18px_40px_rgba(153,51,49,0.22)] transition-all"
              >
                Comenzar a aprender
              </motion.button>

              <motion.p
                className="mt-4 text-xs text-content-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.85, duration: 1 }}
              >
                Serás redirigido al panel principal
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
    </div>
  );
}
