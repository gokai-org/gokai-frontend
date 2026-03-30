"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { MembershipPicker } from "@/features/landing/components/MembershipPicker";

export default function MembershipPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-surface-secondary">
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-surface-primary/20 via-surface-primary/10 to-surface-primary/30" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        {/* Header */}
        <motion.div
          className="flex flex-col items-center text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <a href="/" className="inline-block">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/logos/gokai-logo.svg"
                alt="Gokai"
                width={72}
                height={72}
                priority
              />
            </motion.div>
          </a>

          <p className="mt-6 text-2xl md:text-4xl font-extrabold text-accent">
            Elige tu plan
          </p>
          <h1 className="mt-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary">
            Comienza tu camino en japonés
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-content-secondary">
            Selecciona cómo quieres aprender. Siempre puedes mejorar tu plan
            después.
          </p>
        </motion.div>

        {/* Plan cards */}
        <motion.div
          className="mt-12 w-full max-w-5xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <MembershipPicker mode="link" />
        </motion.div>

        {/* Footer link */}
        <motion.p
          className="mt-10 text-sm text-content-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/auth/login"
            replace
            className="font-semibold text-accent hover:underline transition"
          >
            Inicia sesión
          </Link>
        </motion.p>
      </div>
    </main>
  );
}
