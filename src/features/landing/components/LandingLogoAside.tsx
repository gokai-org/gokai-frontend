"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface LandingLogoAsideProps {
  showLogo: boolean;
  isCenterMode: boolean;
  logoWrapRef: React.RefObject<HTMLDivElement | null>;
}

export function LandingLogoAside({
  showLogo,
  isCenterMode,
  logoWrapRef,
}: LandingLogoAsideProps) {
  if (!showLogo || isCenterMode) return null;

  return (
    <aside className="hidden lg:block">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.96 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-6 top-[calc(50%+38px)] z-20 flex -translate-y-1/2 items-center justify-end overflow-visible"
        >
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
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}