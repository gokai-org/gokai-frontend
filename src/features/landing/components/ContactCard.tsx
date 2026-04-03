"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Send, ArrowRight, Instagram } from "lucide-react";
import {
  fadeUp,
  fadeUpSoft,
  scaleFade,
  staggerContainer,
  cardReveal,
} from "@/features/landing/lib/motionVariants";

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    sublabel: "Gokai",
    href: "https://www.instagram.com/gokai.app",
    Icon: Instagram,
  },
  {
    label: "Correo",
    sublabel: "gokai.learn@gmail.com",
    href: "mailto:gokai.learn@gmail.com",
    Icon: Mail,
  },
  {
    label: "X",
    sublabel: "Gokai",
    href: "https://x.com/gokai_app",
    Icon: XIcon,
  },
] as const;

export function ContactCard() {
  return (
    <motion.article
      variants={staggerContainer(0.08, 0.05)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="overflow-hidden rounded-[36px] shadow-[var(--shadow-xl)]"
    >
      {/* -- Banda superior con gradiente de marca -- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-accent-hover px-5 py-8 sm:px-8 sm:py-12 md:px-12 md:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 select-none overflow-hidden leading-none"
        >
          <span className="block text-[7rem] font-black text-content-inverted/7 sm:text-[10rem] md:text-[13rem] lg:text-[15rem]">
            連絡
          </span>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-content-inverted/5 sm:h-48 sm:w-48"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/3 top-1/2 hidden h-32 w-32 -translate-y-1/2 rounded-full bg-content-inverted/5 sm:block"
        />

        <motion.h3
          variants={fadeUp}
          className="relative z-10 text-2xl font-extrabold leading-[1.05] tracking-tight text-content-inverted sm:text-3xl md:text-5xl lg:text-6xl"
        >
          Hablemos de
          <br />
          <span className="tracking-[0.12em] text-content-inverted/75">GOKAI</span>
        </motion.h3>

        <motion.p
          variants={fadeUpSoft}
          className="relative z-10 mt-3 max-w-xl text-sm leading-relaxed text-content-inverted/70 sm:mt-5 sm:text-base md:text-lg"
        >
          ¿Tienes dudas, ideas o quieres saber más sobre la plataforma?
          Escríbenos y te responderemos a la brevedad.
        </motion.p>

        <motion.div
          variants={scaleFade}
          className="relative z-10 mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="mailto:gokai.learn@gmail.com"
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-content-inverted px-4 py-3 text-xs font-bold text-accent shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:inline-flex sm:w-auto sm:gap-2.5 sm:px-6 sm:py-3.5 sm:text-sm md:text-base"
            >
              <Mail className="h-4 w-4 shrink-0" />
              Contáctanos
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto"
          >
            <Link
              href="/auth/login"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-content-inverted/25 bg-content-inverted/10 px-4 py-3 text-xs font-bold text-content-inverted backdrop-blur-sm transition-all duration-300 hover:bg-content-inverted/20 sm:inline-flex sm:w-auto sm:gap-2.5 sm:px-6 sm:py-3.5 sm:text-sm md:text-base"
            >
              <Send className="h-4 w-4 shrink-0" />
              Probar GOKAI
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* -- Banda inferior: redes sociales -- */}
      <div className="border-t border-accent/10 bg-surface-primary px-4 py-5 sm:px-8 sm:py-8 md:px-12">
        <motion.p
          variants={fadeUpSoft}
          className="mb-3 text-center text-[10px] font-extrabold uppercase tracking-[0.22em] text-content-tertiary sm:mb-5 sm:text-xs"
        >
          Síguenos
        </motion.p>

        <motion.div
          variants={staggerContainer(0.07, 0.1)}
          className="mx-auto grid max-w-3xl grid-cols-1 gap-2 min-[400px]:grid-cols-3 sm:gap-3"
        >
          {SOCIAL_LINKS.map((item) => (
            <motion.div key={item.label} variants={cardReveal}>
              <Link
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border-subtle bg-surface-secondary px-2 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-accent/20 hover:bg-surface-primary hover:shadow-[0_12px_28px_-10px_rgba(153,51,49,0.18)] sm:px-5 sm:py-5 sm:gap-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/[0.08] text-accent transition-all duration-300 group-hover:bg-accent group-hover:text-content-inverted sm:h-10 sm:w-10">
                  <item.Icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-xs font-bold text-content-primary sm:text-sm">
                    {item.label}
                  </p>
                  <p className="truncate text-[10px] text-content-tertiary sm:text-xs">
                    {item.sublabel}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.article>
  );
}