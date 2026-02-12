"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { FeatureCard, PlanCard, ContactCard, LandingNavItem } from "@/features/landing";
import { SECTIONS, FEATURES, HOW_TABS, type HowTabId } from "@/features/landing/data/landingData";

export default function LandingPage() {
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const howSectionRef = useRef<HTMLElement | null>(null);

  const [activeId, setActiveId] = useState<string>("inicio");
  const [showLogo, setShowLogo] = useState(true);

  const [howTab, setHowTab] = useState<HowTabId>("explora");
  const how = HOW_TABS.find((t) => t.id === howTab)!;


  useEffect(() => {
    const updateFromHash = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const hash = raw.replace("#", "");

      if (hash && SECTIONS.some((s) => s.id === hash)) {
        setActiveId(hash);
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      } else {
        setActiveId("inicio");
        const el = document.getElementById("inicio");
        if (el) el.scrollIntoView({ behavior: "auto", block: "start" });
      }
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);
    return () => window.removeEventListener("hashchange", updateFromHash);
  }, []);

  // Active section
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];

        if (visible?.target?.id) setActiveId(visible.target.id);
      },
      {
        threshold: [0.25, 0.4, 0.55, 0.7],
        rootMargin: "-20% 0px -45% 0px",
      }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const currentHash = window.location.hash.replace("#", "");
    if (!activeId) return;

    if (activeId === "inicio") {
      if (currentHash) {
        const urlNoHash = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", urlNoHash);
      }
      return;
    }

    if (currentHash !== activeId) {
      window.history.replaceState(null, "", `#${activeId}`);
    }
  }, [activeId]);

// Show logo
useEffect(() => {
  let raf = 0;

  const update = () => {
    const el = howSectionRef.current;
    if (!el) return;

    const headerOffset = 86;
    const rect = el.getBoundingClientRect();

    const beforeHow = rect.top > headerOffset;
    setShowLogo(beforeHow);
  };

  const onScroll = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", update);

  return () => {
    cancelAnimationFrame(raf);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", update);
  };
}, []);

  // Rotate logo
  useEffect(() => {
    let raf = 0;

    const onScroll = () => {
      if (!showLogo) return;
      if (!logoWrapRef.current) return;

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!logoWrapRef.current) return;
        const y = window.scrollY || 0;
        const deg = y * 0.12;
        logoWrapRef.current.style.transform = `rotate(${deg}deg)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [showLogo]);

  const isCenterMode =
    (SECTIONS.find((s) => s.id === activeId)?.layout ?? "split") === "center";

  const showGraph =
    activeId === "como-funciona" ||
    activeId === "experiencia" ||
    activeId === "planes" ||
    activeId === "contacto";

  return (
<main className="relative min-h-screen bg-[#f3f3f3] text-neutral-900 overflow-x-hidden pt-[76px]">
      {/* GRAFO */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <AnimatedGraphBackground
          className={["transition-opacity duration-500", showGraph ? "opacity-60" : "opacity-0"].join(" ")}
          mode="screen"
          variant="dimmed"
          edgeMargin={140}
          density={0.00006}
          maxDist={180}
          speed={0.2}
        />
      </div>

      {/* NAV */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-3 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-wide">GOKAI</span>
            <span className="text-xs leading-tight text-neutral-600">
              語<br />界
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex relative">
            <LandingNavItem id="inicio" href="#inicio" active={activeId === "inicio"}>
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

            <LandingNavItem id="planes" href="#planes" active={activeId === "planes"}>
              Planes
            </LandingNavItem>

            <LandingNavItem id="contacto" href="#contacto" active={activeId === "contacto"}>
              Contacto
            </LandingNavItem>

            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-black/5"
            >
              Iniciar sesión
            </Link>
          </nav>

          <Link
            href="/auth/login"
            className="rounded-full bg-[#993331] px-4 py-2 text-sm font-semibold text-white md:hidden"
          >
            Iniciar
          </Link>
        </div>
      </header>

      {/* BODY */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <div
          className={[
            "grid grid-cols-1 gap-10 lg:gap-16",
            isCenterMode ? "lg:grid-cols-1" : "lg:grid-cols-2",
          ].join(" ")}
        >
          {/* LEFT */}
          <div className={["py-10", isCenterMode ? "lg:ml-0" : "lg:-ml-16 xl:-ml-24 2xl:-ml-32"].join(" ")}>
            {SECTIONS.map((s) => {
              const isActive = activeId === s.id;
              const isCenter = (s.layout ?? "split") === "center";

              return (
                <motion.section
                  key={s.id}
                  id={s.id}
                  data-section
                  ref={s.id === "como-funciona" ? howSectionRef : undefined}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={[
                    "scroll-mt-28",
                    "min-h-[calc(100vh-76px)]",
                    "flex items-center",
                    "py-14",
                    isCenter ? "justify-center" : "",
                  ].join(" ")}
                >
                  <div
                    className={[
                      isCenter ? "mx-auto w-full max-w-6xl text-center" : "max-w-2xl",
                      "transition-all duration-500",
                      isActive
                        ? "opacity-100 translate-y-0"
                        : s.id === "contacto"
                        ? "opacity-100 translate-y-0"
                        : "opacity-100 translate-y-0 md:opacity-70 md:translate-y-2",
                    ].join(" ")}
                  >
                    {/* TITULOS ESPECIALES */}
                    {s.id === "experiencia" ? (
                      <div className="text-center">
                        <p className="text-2xl md:text-4xl font-extrabold text-[#993331]">
                          Más que una app de idiomas
                        </p>
                        <h2 className="mt-2 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                          Una experiencia inteligente
                        </h2>
                      </div>
                    ) : s.id === "planes" ? (
                      <div className="text-center">
                        <p className="text-3xl md:text-5xl font-extrabold text-[#993331]">
                          Empieza gratis
                        </p>
                        <h2 className="mt-2 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                          Desbloquea todo con <span className="text-[#993331]">GOKAI+</span>
                        </h2>
                      </div>
                    ) : s.id === "contacto" ? (
                      <div className="text-center">
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                          <span className="block text-[#993331]">{s.titleA}</span>
                          <span className="block">{s.titleB}</span>
                        </h2>
                        <p className="mx-auto mt-4 max-w-3xl text-base md:text-xl leading-relaxed text-neutral-700">
                          {s.desc}
                        </p>
                      </div>
                    ) : (
                      <>
                        <h2
                          className={[
                            "font-extrabold leading-[1.02] tracking-tight",
                            isCenter
                              ? (s.id === "como-funciona"
                                  ? "text-4xl md:text-6xl lg:text-7xl"
                                  : "text-5xl md:text-7xl lg:text-8xl")
                              : "text-6xl md:text-7xl",
                          ].join(" ")}
                        >
                          <span className={[isCenter ? "block lg:inline" : "block"].join(" ")}>
                            {s.titleA}
                          </span>
                          <span
                            className={[
                              isCenter ? "block lg:inline lg:ml-3 text-[#993331]" : "block text-[#993331]",
                            ].join(" ")}
                          >
                            {s.titleB}
                          </span>
                        </h2>

                        <p
                          className={[
                            "leading-relaxed text-neutral-700",
                            isCenter ? "mx-auto mt-2 max-w-3xl text-base md:text-xl" : "mt-6 text-xl md:text-2xl",
                          ].join(" ")}
                        >
                          {s.desc}
                        </p>
                      </>
                    )}

                    {s.cta && !isCenter && (
                      <motion.div 
                        className="mt-8"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Link
                            href={s.cta.href}
                            className="inline-flex rounded-full bg-[#993331] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-[#882d2d] md:px-10 md:py-5 md:text-xl"
                          >
                            {s.cta.label}
                          </Link>
                        </motion.div>
                      </motion.div>
                    )}

                    {s.id === "inicio" && (
                      <div className="mt-14 flex items-center gap-2 text-xs text-neutral-400">
                        <span>Desliza para ver más</span>
                        <span className="translate-y-[1px]">↓</span>
                      </div>
                    )}

                    {/* FUNCIONES */}
                    {s.id === "como-funciona" && (
                      <div className="mt-2">
                        <motion.div 
                          className="mx-auto w-full max-w-5xl"
                          initial={{ opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2, duration: 0.5 }}
                        >
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={howTab}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="relative aspect-[16/9] w-full"
                            >
                              <Image src={how.img} alt={how.label} fill className="object-contain" />
                            </motion.div>
                          </AnimatePresence>
                        </motion.div>

                        <motion.div 
                          className="mt-6 flex flex-wrap items-center justify-center gap-5"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4, duration: 0.5 }}
                        >
                          {HOW_TABS.map((t, idx) => (
                            <motion.button
                              key={t.id}
                              type="button"
                              onClick={() => setHowTab(t.id)}
                              initial={{ opacity: 0, y: 20 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.5 + idx * 0.1, duration: 0.4 }}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className={[
                                "relative w-56 md:w-64 text-center whitespace-nowrap rounded-full px-7 py-4 text-base md:px-10 md:py-5 md:text-lg font-semibold transition",
                                t.id === howTab
                                  ? "bg-[#993331] text-white shadow-sm"
                                  : "bg-[#993331]/90 text-white/90 hover:bg-[#882d2d] hover:text-white",
                              ].join(" ")}
                            >
                              {t.label}
                              {t.id === howTab && (
                                <motion.div
                                  layoutId="activeTab"
                                  className="absolute inset-0 rounded-full bg-[#993331]"
                                  style={{ zIndex: -1 }}
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                            </motion.button>
                          ))}
                        </motion.div>
                      </div>
                    )}

                    {/* EXPERIENCIA */}
                    {s.id === "experiencia" && (
                      <motion.div 
                        className="mt-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {FEATURES.map((f, idx) => (
                            <FeatureCard key={f.title} {...f} index={idx} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* PLANES */}
                    {s.id === "planes" && (
                      <motion.div 
                        className="mt-12"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
                          <PlanCard
                            variant="free"
                            title="GOKAI"
                            subtitle="Perfecto para comenzar tu viaje en japonés sin compromiso."
                            price="$ 0"
                            period="MXN / mensual"
                            buttonText="Comenzar gratis"
                            bullets={["Acceso a módulos básicos.", "Grafo limitado.", "Sin chatbot."]}
                            index={0}
                          />

                          <PlanCard
                            variant="plus"
                            title="GOKAI+"
                            subtitle="Desbloquea todo el poder de la IA y repasos inteligentes."
                            price="$ 199"
                            period="MXN / mensual"
                            buttonText="Suscribirme"
                            bullets={["IA completa.", "Chatbot ilimitado.", "Estadísticas avanzadas."]}
                            index={1}
                          />
                        </div>
                      </motion.div>
                    )}

                    {/* CONTACTO */}
                    {s.id === "contacto" && (
                      <motion.div 
                        className="mt-10"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                      >
                        <ContactCard />
                      </motion.div>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </div>

          {/* RIGHT LOGO */}
          {showLogo && !isCenterMode && (
            <aside className="hidden lg:block">
              <div className="fixed right-6 top-[calc(50%+38px)] z-20 -translate-y-1/2 flex items-center justify-end overflow-visible">
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
                    className="h-auto w-full select-none"
                  />
                </div>
              </div>
            </aside>
          )}

        </div>
      </div>

      <footer className="relative z-10 border-t border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-neutral-600">
          © {new Date().getFullYear()} GOKAI — Aprende japonés con IA.
        </div>
      </footer>
    </main>
  );
}