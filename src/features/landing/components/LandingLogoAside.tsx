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
      {/* ── Vista móvil / tablet ── */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key="logo-mobile"
            initial={{ opacity: 0, x: 40, scale: 0.92 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, x: 30 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-none fixed right-[-140px] top-[200px] z-0 lg:hidden"
            aria-hidden="true"
          >
            <div
              ref={logoMobileRef}
              className="w-[280px] will-change-transform sm:w-[340px]"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Vista desktop ── */}
      <AnimatePresence mode="wait">
        {visible && (
          <motion.aside
            key="logo-desktop"
            initial={{ opacity: 0, x: 30, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="hidden lg:block"
          >
            <div className="fixed right-6 top-[calc(50%+38px)] z-20 flex -translate-y-1/2 items-center justify-end overflow-visible">
              <div
                ref={logoWrapRef}
                aria-hidden="true"
                className="pointer-events-none will-change-transform"
                style={{ width: "clamp(600px, 40vw, 900px)" }}
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
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}