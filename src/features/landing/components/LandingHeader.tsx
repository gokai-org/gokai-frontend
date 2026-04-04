"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { LandingNavItem, LandingThemeToggle } from "@/features/landing";

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border-subtle bg-surface-primary/88 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between px-3 py-2 min-[400px]:px-4 sm:px-6 sm:py-3 md:px-10 lg:px-14 2xl:px-20">
        <div className="flex items-center gap-2 min-[400px]:gap-3 md:gap-5">
          <div className="relative h-8 w-8 shrink-0 min-[400px]:h-9 min-[400px]:w-9 sm:h-11 sm:w-11 md:h-12 md:w-12">
            <Image
              src="/logos/gokai-logo.svg"
              alt="Logo de GOKAI"
              fill
              priority
              className="object-contain dark:hidden"
            />
            <Image
              src="/logos/gokai-logo-dark.svg"
              alt=""
              fill
              priority
              className="hidden object-contain dark:block"
            />
          </div>

          <a
            href="#inicio"
            onClick={(e) => handleAnchorClick(e, "inicio")}
            className="text-xl font-black leading-none tracking-[0.12em] text-content-primary min-[400px]:text-2xl sm:text-[2rem] md:text-[2.35rem]"
          >
            GOKAI
          </a>

          <div className="flex flex-col items-center justify-center leading-none text-content-primary">
            <span className="text-[0.85rem] font-semibold min-[400px]:text-[1rem] md:text-[1.35rem]">語</span>
            <span className="mt-0.5 text-[0.85rem] font-semibold min-[400px]:text-[1rem] md:text-[1.35rem]">界</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden items-center gap-2 rounded-full border border-border-default/70 bg-surface-primary/80 p-1.5 shadow-[var(--shadow-md)] backdrop-blur-xl lg:flex">
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

            <motion.div
              whileHover={{ y: -1.5, scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <Link
                href="/auth/login"
                className="ml-2 inline-flex rounded-full bg-gradient-to-r from-accent via-accent to-accent-hover px-5 py-3 text-sm font-bold text-content-inverted shadow-lg shadow-accent/20"
              >
                Iniciar sesión
              </Link>
            </motion.div>
          </div>

          <LandingThemeToggle />

          <Link
            href="/auth/login"
            className="rounded-full bg-gradient-to-r from-accent to-accent-hover px-3 py-2 text-xs font-bold text-content-inverted shadow-lg shadow-accent/20 min-[400px]:px-4 min-[400px]:py-2.5 sm:px-5 sm:py-3 sm:text-sm lg:hidden"
          >
            Iniciar
          </Link>
        </div>
      </div>
    </header>
  );
}