"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import AnimatedGraphBackground from "../components/graph/AnimatedGraphBackground";

type Section = {
  id: string;
  nav: string;
  titleA: string;
  titleB: string;
  desc: string;
  cta?: { label: string; href: string };
  layout?: "split" | "center";
};

type HowTabId = "explora" | "recompensas" | "repaso";

type Feature = {
  title: string;
  desc: string;
  icon: string;
};

export default function LandingPage() {
  const logoWrapRef = useRef<HTMLDivElement | null>(null);
  const howSectionRef = useRef<HTMLElement | null>(null);

  const [activeId, setActiveId] = useState<string>("inicio");
  const [showLogo, setShowLogo] = useState(true);

  const HOW_TABS = useMemo(
    () =>
      [
        { id: "explora" as const, label: "Explora tus intereses", img: "/mockups/explora.png" },
        { id: "recompensas" as const, label: "Recompensas", img: "/mockups/recompensas.png" },
        { id: "repaso" as const, label: "Repasa con IA", img: "/mockups/repaso.png" },
      ] as const,
    []
  );

  const [howTab, setHowTab] = useState<HowTabId>("explora");
  const how = HOW_TABS.find((t) => t.id === howTab)!;

  const FEATURES: Feature[] = useMemo(
    () => [
      {
        title: "IA adaptativa",
        desc: "GOKAI analiza tu progreso y estilo de estudio para recomendarte lecciones, repasos y desafíos personalizados.",
        icon: "/icons/ia.svg",
      },
      {
        title: "Ruta personalizada",
        desc: "Visualiza tu camino con puntos interactivos que representan tus avances y nuevas rutas por descubrir.",
        icon: "/icons/ruta.svg",
      },
      {
        title: "Chatbot de repaso",
        desc: "Conversa con un asistente inteligente que te ayuda a reforzar vocabulario, gramática y comprensión de forma natural.",
        icon: "/icons/chatbot.svg",
      },
      {
        title: "Recompensas",
        desc: "Gana puntos, insignias y niveles al completar ejercicios. Cada logro desbloquea nuevas rutas en tu aprendizaje.",
        icon: "/icons/recompensas.svg",
      },
      {
        title: "Aprendizaje integral",
        desc: "GOKAI integra las cinco habilidades del idioma: escribir, leer, pensar, hablar y escuchar, para un progreso equilibrado.",
        icon: "/icons/integral.svg",
      },
      {
        title: "IA que te escucha",
        desc: "Habla japonés, y deja que la inteligencia artificial te ayude a perfeccionar tu entonación y confianza.",
        icon: "/icons/escucha.svg",
      },
    ],
    []
  );

  const sections: Section[] = useMemo(
    () => [
      {
        id: "inicio",
        nav: "Inicio",
        titleA: "Aprende",
        titleB: "Japonés",
        desc: "Con GOKAI, domina el japonés a tu ritmo mediante IA, gamificación y rutas dinámicas de aprendizaje que se adaptan a ti.",
        cta: { label: "Empieza gratis", href: "/auth/login" },
        layout: "split",
      },
      {
        id: "caracteristicas",
        nav: "Características",
        titleA: "Domina el trazo con precisión",
        titleB: "Escritura",
        desc: "Practica la escritura de kanji. Cada trazo refuerza tu memoria visual y motriz, mientras GOKAI analiza tu progreso y te corrige con IA.",
        layout: "split",
      },
      {
        id: "leer",
        nav: "Leer",
        titleA: "Comprende y conecta con el idioma",
        titleB: "Leer",
        desc: "Mejora tu comprensión lectora con textos adaptados a tu nivel. GOKAI mide tu entendimiento y te sugiere nuevos recursos según los temas y estructuras que dominas.",
        layout: "split",
      },
      {
        id: "pensar",
        nav: "Pensar",
        titleA: "Comprende antes de traducir",
        titleB: "Pensar",
        desc: "Entrena tu mente para pensar en japonés, no solo traducir. La IA te guía con ejercicios semánticos que fortalecen tu intuición lingüística y cultural.",
        layout: "split",
      },
      {
        id: "hablar",
        nav: "Hablar",
        titleA: "Expresa tus ideas con naturalidad",
        titleB: "Hablar",
        desc: "Practica tu pronunciación y entonación con análisis de voz. Recibe retroalimentación personalizada para mejorar tu fluidez y confianza al comunicarte.",
        layout: "split",
      },
      {
        id: "escuchar",
        nav: "Escuchar",
        titleA: "Entiende más allá de las palabras",
        titleB: "Escuchar",
        desc: "Escucha ejercicios y entrena tu oído. GOKAI evalúa tu comprensión auditiva y adapta el contenido según tu desempeño.",
        layout: "split",
      },
      {
        id: "como-funciona",
        nav: "Cómo funciona",
        titleA: "¿Cómo funciona",
        titleB: "GOKAI?",
        desc: "Una experiencia educativa personalizada con inteligencia artificial, diseñada para motivarte a diario.",
        layout: "center",
      },
      {
        id: "experiencia",
        nav: "Experiencia",
        titleA: "Más que una app de idiomas",
        titleB: "Una experiencia inteligente",
        desc: "",
        layout: "center",
      },
      {
        id: "planes",
        nav: "Planes",
        titleA: "Empieza gratis",
        titleB: "Desbloquea todo con GOKAI+",
        desc: "",
        layout: "center",
      },
    ],
    []
  );

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

  // Hide logo
  useEffect(() => {
    let raf = 0;

    const updateShowLogo = () => {
      if (!howSectionRef.current) return;

      const headerOffset = 86;
      const rect = howSectionRef.current.getBoundingClientRect();
      const shouldShow = rect.top > headerOffset;
      setShowLogo(shouldShow);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateShowLogo);
    };

    updateShowLogo();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateShowLogo);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateShowLogo);
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
        const y = window.scrollY || 0;
        const deg = y * 0.12;
        logoWrapRef.current!.style.transform = `rotate(${deg}deg)`;
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
    (sections.find((s) => s.id === activeId)?.layout ?? "split") === "center";

  const showGraph = activeId === "como-funciona" || activeId === "experiencia" || activeId === "planes";

  return (
    <main className="relative min-h-screen bg-[#f3f3f3] text-neutral-900">
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
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="flex w-full items-center justify-between px-3 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold tracking-wide">GOKAI</span>
            <span className="text-xs leading-tight text-neutral-600">
              語<br />界
            </span>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <NavItem href="#inicio" active={activeId === "inicio"}>
              Inicio
            </NavItem>

            <NavItem
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
            </NavItem>

            <NavItem
              href="#como-funciona"
              active={activeId === "como-funciona" || activeId === "experiencia"}
            >
              Funciones
            </NavItem>

            <NavItem href="#planes" active={activeId === "planes"}>
              Planes
            </NavItem>

            <Link
              href="/auth/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-black/5"
            >
              Iniciar sesión
            </Link>
          </nav>

          <Link href="/auth/login" className="rounded-full bg-[#993331] px-4 py-2 text-sm font-semibold text-white md:hidden">
            Iniciar
          </Link>
        </div>
      </header>

      {/* BODY */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6">
        <div className={["grid grid-cols-1 gap-10 lg:gap-16", isCenterMode ? "lg:grid-cols-1" : "lg:grid-cols-2"].join(" ")}>
          {/* LEFT */}
          <div className={["py-10", isCenterMode ? "lg:ml-0" : "lg:-ml-12 xl:-ml-20 2xl:-ml-28"].join(" ")}>
            {sections.map((s) => {
              const isActive = activeId === s.id;
              const isCenter = (s.layout ?? "split") === "center";

              return (
                <section
                  key={s.id}
                  id={s.id}
                  data-section
                  ref={s.id === "como-funciona" ? howSectionRef : undefined}
                  className={["scroll-mt-28", "min-h-[calc(100vh-76px)]", "flex items-center", "py-14", isCenter ? "justify-center" : ""].join(
                    " "
                  )}
                >
                  <div
                    className={[
                      isCenter ? "mx-auto w-full max-w-6xl text-center" : "max-w-xl",
                      "transition-all duration-500",
                      isActive ? "opacity-100 translate-y-0" : "opacity-70 translate-y-2",
                    ].join(" ")}
                  >
                    {/* TITULOS */}
                    {s.id === "experiencia" ? (
                      <div className="text-center">
                        <p className="text-2xl md:text-4xl font-extrabold text-[#993331]">Más que una app de idiomas</p>
                        <h2 className="mt-2 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">Una experiencia inteligente</h2>
                      </div>
                    ) : s.id === "planes" ? (
                      <div className="text-center">
                        <p className="text-3xl md:text-5xl font-extrabold text-[#993331]">Empieza gratis</p>
                        <h2 className="mt-2 text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                          Desbloquea todo con <span className="text-[#993331]">GOKAI+</span>
                        </h2>
                      </div>
                    ) : (
                      <>
                        <h2
                          className={[
                            "font-extrabold leading-[1.02] tracking-tight",
                            isCenter
                              ? (s.id === "como-funciona" ? "text-4xl md:text-6xl lg:text-7xl" : "text-5xl md:text-7xl lg:text-8xl")
                              : "text-6xl md:text-7xl",
                          ].join(" ")}
                        >
                          <span className={[isCenter ? "block lg:inline" : "block"].join(" ")}>{s.titleA}</span>
                          <span className={[isCenter ? "block lg:inline lg:ml-3 text-[#993331]" : "block text-[#993331]"].join(" ")}>{s.titleB}</span>
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
                      <div className="mt-8">
                        <Link
                          href={s.cta.href}
                          className="inline-flex rounded-full bg-[#993331] px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-[#882d2d] md:px-10 md:py-5 md:text-xl"
                        >
                          {s.cta.label}
                        </Link>
                      </div>
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
                        <div className="mx-auto w-full max-w-5xl">
                          <div className="relative aspect-[16/9] w-full">
                            <Image src={how.img} alt={how.label} fill className="object-contain" />
                          </div>
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-5">
                          {HOW_TABS.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setHowTab(t.id)}
                              className={[
                                "w-56 md:w-64 text-center whitespace-nowrap rounded-full px-7 py-4 text-base md:px-10 md:py-5 md:text-lg font-semibold transition",
                                t.id === howTab ? "bg-[#993331] text-white shadow-sm" : "bg-[#993331]/90 text-white/90 hover:bg-[#882d2d] hover:text-white",
                              ].join(" ")}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* EXPERIENCIA */}
                    {s.id === "experiencia" && (
                      <div className="mt-12">
                        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                          {FEATURES.map((f) => (
                            <FeatureCard key={f.title} {...f} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PLANES*/}
                    {s.id === "planes" && (
                      <div className="mt-12">
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
                          <PlanCard
                            variant="free"
                            title="GOKAI"
                            subtitle="Perfecto para comenzar tu viaje en japonés sin compromiso."
                            price="$ 0"
                            period="MXN / mensual"
                            buttonText="Comenzar gratis"
                            bullets={["Acceso a módulos básicos.", "Grafo limitado.", "Sin chatbot."]}
                          />

                          <PlanCard
                            variant="plus"
                            title="GOKAI+"
                            subtitle="Desbloquea todo el poder de la IA y repasos inteligentes."
                            price="$ 199"
                            period="MXN / mensual"
                            buttonText="Suscribirme"
                            bullets={["IA completa.", "Chatbot ilimitado.", "Estadísticas avanzadas."]}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>

          {/* RIGHT LOGO */}
          {showLogo && !isCenterMode && (
            <aside className="hidden lg:block">
              <div className="sticky top-24 flex h-[calc(100vh-120px)] items-center justify-end overflow-visible">
                <div
                  ref={logoWrapRef}
                  className="will-change-transform translate-x-16 scale-[1.3] transition-transform duration-75 md:translate-x-28 lg:translate-x-36 xl:translate-x-48 xl:scale-[1.55] 2xl:translate-x-56"
                  aria-hidden="true"
                >
                  <Image src="/logos/gokai-big.svg" alt="Gokai" width={980} height={980} priority />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <footer className="relative z-10 border-t border-black/10 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-neutral-600">© {new Date().getFullYear()} GOKAI — Aprende japonés con IA.</div>
      </footer>
    </main>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  return (
    <div className="rounded-3xl bg-white/90 p-7 text-left shadow-[0_10px_30px_rgba(0,0,0,0.06)] ring-1 ring-black/5 backdrop-blur">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#993331]">
        <Image src={icon} alt="" width={30} height={30} />
      </div>
      <h3 className="mt-5 text-2xl font-extrabold tracking-tight">{title}</h3>
      <p className="mt-3 text-base leading-relaxed text-neutral-700">{desc}</p>
    </div>
  );
}

function PlanCard({
  variant,
  title,
  subtitle,
  price,
  period,
  buttonText,
  bullets,
}: {
  variant: "free" | "plus";
  title: string;
  subtitle: string;
  price: string;
  period: string;
  buttonText: string;
  bullets: string[];
}) {
  const headerBg = "bg-[#b34a45]";

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-white ring-1 ring-black/10 shadow-[0_18px_55px_rgba(0,0,0,0.18)]">
      <div className="pointer-events-none absolute inset-0 -z-10" />
      <div className="pointer-events-none absolute -left-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />
      <div className="pointer-events-none absolute -right-8 top-1/2 -z-10 h-16 w-16 -translate-y-1/2 rounded-full bg-white ring-1 ring-black/10" />

      <div className={[headerBg, "px-8 pt-7 pb-6"].join(" ")}>
        <h3 className="text-3xl font-extrabold tracking-wide text-white">{title}</h3>
        <p className="mt-2 text-sm md:text-base text-white/90">{subtitle}</p>
      </div>

      <div className="bg-white px-8 pb-8 pt-7">
        <div className="rounded-2xl bg-white ring-1 ring-black/10 shadow-sm p-5">
          <div className="flex items-end gap-3">
            <span className="text-neutral-300 text-2xl font-extrabold">$</span>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-extrabold tracking-tight text-neutral-900">
                {price.replace("$", "").trim()}
              </span>
              <span className="text-xs md:text-sm text-neutral-400">{period}</span>
            </div>
          </div>

          <button
            type="button"
            className="mt-4 w-full rounded-xl bg-[#993331] py-3 text-base font-extrabold text-white shadow-sm hover:bg-[#882d2d]"
          >
            {buttonText}
          </button>
        </div>

        <ul className="mt-6 space-y-3 text-left">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 text-sm md:text-base text-neutral-800">
              <span className="mt-[2px] inline-flex h-6 w-6 items-center justify-center rounded-full bg-white ring-1 ring-black/10">
                <span className="text-[#993331] font-black">✓</span>
              </span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={[
        "relative py-1 transition-colors",
        active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900",
      ].join(" ")}
    >
      {children}
      <span
        className={[
          "absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#993331] transition-all",
          active ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
    </a>
  );
}
