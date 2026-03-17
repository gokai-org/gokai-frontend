"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Send } from "lucide-react";
import SocialIcons from "@/features/landing/components/SocialIcons";

export function ContactCard() {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-[40px] border border-black/5 bg-white/95 p-8 shadow-[0_22px_50px_-22px_rgba(0,0,0,0.22)] md:p-10 lg:p-12"
    >
      <div className="absolute right-[-20px] top-[-20px] h-36 w-36 rounded-full bg-[#993331]/[0.045]" />
      <div className="absolute bottom-[-26px] left-[42%] h-28 w-28 rounded-full bg-[#993331]/[0.035]" />

      <div className="relative z-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
        <div>
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[#993331]/10 text-[#993331]">
            <MessageCircle className="h-10 w-10" />
          </div>

          <h3 className="text-4xl font-extrabold tracking-tight text-neutral-950 md:text-5xl">
            Hablemos de GOKAI
          </h3>

          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-neutral-600 md:text-[1.35rem]">
            ¿Tienes dudas, ideas, comentarios o quieres saber más sobre la
            plataforma? Escríbenos y te responderemos lo antes posible.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="mailto:contacto@gokai.app"
              className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-7 py-4 text-xl font-extrabold text-white shadow-[0_18px_38px_-16px_rgba(153,51,49,0.52)] transition-all duration-300 hover:shadow-[0_22px_48px_-18px_rgba(153,51,49,0.60)]"
            >
              <Mail className="h-5 w-5" />
              Contactanos
            </Link>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-3 rounded-full bg-neutral-100 px-7 py-4 text-xl font-bold text-neutral-950 transition-all duration-300 hover:bg-neutral-200"
            >
              <Send className="h-5 w-5" />
              Probar GOKAI
            </Link>
          </div>
        </div>

        <div className="lg:justify-self-end">
          <div className="rounded-[30px] border border-black/5 bg-[#faf8f7] p-7 shadow-inner">
            <p className="text-sm font-extrabold uppercase tracking-[0.22em] text-neutral-500">
              Síguenos
            </p>

            <div className="mt-6">
              <SocialIcons />
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}