"use client";

import { motion } from "framer-motion";
import {
  IconPhone,
  IconMail,
  IconTwitter,
  IconInstagram,
  IconFacebook,
  IconWhatsApp,
} from "./SocialIcons";

function SocialBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.15, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#993331] shadow-sm ring-1 ring-black/10 cursor-pointer hover:shadow-lg"
    >
      <div className="text-white">{children}</div>
    </motion.div>
  );
}

export default function ContactCard() {
  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-[28px] bg-white ring-1 ring-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
      <div className="h-8 bg-[#b34a45]" />

      <div className="px-8 pb-10 pt-8 md:px-12">
        <div className="text-left">
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#993331]">
            ¿Tienes alguna duda?
          </h3>
          <h4 className="mt-1 text-4xl md:text-6xl font-extrabold tracking-tight text-neutral-900">
            Escríbenos
          </h4>
          <p className="mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-neutral-700">
            Tu aprendizaje es nuestra prioridad. Si tienes alguna pregunta o
            sugerencia, estamos aquí para ayudarte.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <IconPhone />
            <div className="text-left">
              <p className="text-lg font-extrabold text-neutral-900">
                Teléfono
              </p>
              <p className="text-neutral-600">+52 33-2380-5480</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <IconMail />
            <div className="text-left">
              <p className="text-lg font-extrabold text-neutral-900">Email</p>
              <p className="text-neutral-600">contacto@gokai.com</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-left">
          <p className="text-xl font-extrabold text-neutral-900">
            Redes sociales
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SocialBadge>
              <IconTwitter />
            </SocialBadge>
            <SocialBadge>
              <IconInstagram />
            </SocialBadge>
            <SocialBadge>
              <IconFacebook />
            </SocialBadge>
            <SocialBadge>
              <IconWhatsApp />
            </SocialBadge>
          </div>
        </div>
      </div>
    </div>
  );
}
