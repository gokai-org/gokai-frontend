"use client";

import { motion } from "framer-motion";
import { LandingNavItem } from "@/features/landing";

interface LandingHeaderProps {
  activeId: string;
}

export function LandingHeader({ activeId }: LandingHeaderProps) {
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    targetId: string
  ) => {
    e.preventDefault();

    const el = document.getElementById(targetId);
    if (!el) return;

    const headerOffset = 110;
    const y = el.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.history.replaceState(null, "", `#${targetId}`);
    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/88 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-6 py-3 md:px-10 lg:px-14 2xl:px-20">
        <div className="flex items-center gap-4 md:gap-5">
          <a
            href="#inicio"
            onClick={(e) => handleAnchorClick(e, "inicio")}
            className="text-[2rem] font-black leading-none tracking-[0.12em] text-neutral-950 md:text-[2.35rem]"
          >
            GOKAI
          </a>

          <div className="flex flex-col items-center justify-center leading-none text-neutral-950">
            <span className="text-[1.15rem] font-semibold md:text-[1.35rem]">語</span>
            <span className="mt-1 text-[1.15rem] font-semibold md:text-[1.35rem]">界</span>
          </div>
        </div>

        <nav className="relative hidden items-center gap-2 rounded-full border border-black/[0.06] bg-white/80 p-1.5 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.18)] backdrop-blur-xl md:flex">
          <LandingNavItem
            id="inicio"
            href="#inicio"
            active={activeId === "inicio"}
            onClick={(e) => handleAnchorClick(e, "inicio")}
          >
            Inicio
          </LandingNavItem>

          <LandingNavItem
            id="caracteristicas"
            href="#caracteristicas"
            active={
              activeId === "caracteristicas" ||
              activeId === "leer" ||
              activeId === "pensar" ||
              activeId === "hablar" ||
              activeId === "escuchar"
            }
            onClick={(e) => handleAnchorClick(e, "caracteristicas")}
          >
            Características
          </LandingNavItem>

          <LandingNavItem
            id="funciones"
            href="#como-funciona"
            active={activeId === "como-funciona" || activeId === "experiencia"}
            onClick={(e) => handleAnchorClick(e, "como-funciona")}
          >
            Funciones
          </LandingNavItem>

          <LandingNavItem
            id="planes"
            href="#planes"
            active={activeId === "planes"}
            onClick={(e) => handleAnchorClick(e, "planes")}
          >
            Planes
          </LandingNavItem>

          <LandingNavItem
            id="contacto"
            href="#contacto"
            active={activeId === "contacto"}
            onClick={(e) => handleAnchorClick(e, "contacto")}
          >
            Contacto
          </LandingNavItem>

          <motion.a
            href="/auth/login"
            whileHover={{ y: -1.5, scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="ml-2 inline-flex rounded-full bg-gradient-to-r from-[#b8423d] via-[#a73834] to-[#8d2d2a] px-5 py-3 text-sm font-bold text-white shadow-[0_14px_30px_-12px_rgba(153,51,49,0.36)]"
          >
            Iniciar sesión
          </motion.a>
        </nav>

        <a
          href="/auth/login"
          className="rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 md:hidden"
        >
          Iniciar
        </a>
      </div>
    </header>
  );
}