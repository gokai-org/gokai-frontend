"use client";

import Link from "next/link";
import { LandingNavItem } from "@/features/landing";

interface LandingHeaderProps {
  activeId: string;
}

export function LandingHeader({ activeId }: LandingHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/5 bg-white/88 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-6 py-3 md:px-10 lg:px-14 2xl:px-20">
        <div className="flex items-center gap-4 md:gap-5">
          <Link
            href="#inicio"
            className="text-[2rem] font-black leading-none tracking-[0.12em] text-neutral-950 md:text-[2.35rem]"
          >
            GOKAI
          </Link>

          <div className="flex flex-col items-center justify-center leading-none text-neutral-950">
            <span className="text-[1.15rem] font-semibold md:text-[1.35rem]">語</span>
            <span className="mt-1 text-[1.15rem] font-semibold md:text-[1.35rem]">界</span>
          </div>
        </div>

        <nav className="relative hidden items-center gap-2 rounded-full border border-black/5 bg-black/[0.03] p-1.5 shadow-sm md:flex">
          <LandingNavItem
            id="inicio"
            href="#inicio"
            active={activeId === "inicio"}
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
          >
            Características
          </LandingNavItem>

          <LandingNavItem
            id="funciones"
            href="#como-funciona"
            active={activeId === "como-funciona" || activeId === "experiencia"}
          >
            Funciones
          </LandingNavItem>

          <LandingNavItem
            id="planes"
            href="#planes"
            active={activeId === "planes"}
          >
            Planes
          </LandingNavItem>

          <LandingNavItem
            id="contacto"
            href="#contacto"
            active={activeId === "contacto"}
          >
            Contacto
          </LandingNavItem>

          <Link
            href="/auth/login"
            className="ml-2 inline-flex rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
          >
            Iniciar sesión
          </Link>
        </nav>

        <Link
          href="/auth/login"
          className="rounded-full bg-gradient-to-r from-[#993331] to-[#7a2927] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#993331]/20 md:hidden"
        >
          Iniciar
        </Link>
      </div>
    </header>
  );
}