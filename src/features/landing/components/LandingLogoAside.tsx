"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

interface LandingLogoAsideProps {
  showLogo: boolean;
  isCenterMode: boolean;
  logoWrapRef: React.RefObject<HTMLDivElement | null>;
  logoMobileRef: React.RefObject<HTMLDivElement | null>;
}

export function LandingLogoAside({
  showLogo,
  isCenterMode,
  logoWrapRef,
  logoMobileRef,
}: LandingLogoAsideProps) {
  const visible = showLogo && !isCenterMode;

  return (
    <>
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key="logo-mobile"
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-none fixed bottom-5 right-4 z-20 lg:hidden"
            aria-hidden="true"
          >
            <div className="rounded-[28px] border border-white/70 bg-white/72 p-3 shadow-[0_18px_34px_-22px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <div
                ref={logoMobileRef}
                className="w-16 will-change-transform"
              >
                <Image
                  src="/logos/gokai-logo.svg"
                  alt=""
                  width={1000}
                  height={1000}
                  priority
                  className="h-auto w-full select-none"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {visible && (
          <motion.aside
            key="logo-desktop"
            initial={{ opacity: 0, x: 36, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="hidden lg:block"
          >
            <div className="fixed right-8 top-[54%] z-20 flex -translate-y-1/2 items-center justify-end">
              <div className="pointer-events-none relative overflow-hidden rounded-[34px] border border-white/70 bg-white/72 px-5 py-6 shadow-[0_28px_52px_-30px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
                <p className="mb-3 text-[11px] font-black uppercase tracking-[0.28em] text-content-muted">
                  Escena GOKAI
                </p>
                <div
                  ref={logoWrapRef}
                  aria-hidden="true"
                  className="mx-auto w-[170px] will-change-transform xl:w-[210px]"
                >
                  <Image
                    src="/logos/gokai-logo.svg"
                    alt="Gokai"
                    width={900}
                    height={900}
                    priority
                    className="h-auto w-full select-none opacity-95"
                  />
                </div>
                <div className="mt-4 space-y-2 text-right text-xs font-medium text-content-secondary">
                  <p>Rutas dinámicas</p>
                  <p>IA adaptativa</p>
                  <p>Progreso conectado</p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}