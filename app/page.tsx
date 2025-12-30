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
      {
        id: "contacto",
        nav: "Contacto",
        titleA: "¿Tienes alguna duda?",
        titleB: "Escríbenos",
        desc: "Tu aprendizaje es nuestra prioridad. Si tienes alguna pregunta o sugerencia, estamos aquí para ayudarte.",
        layout: "center",
      },
    ],
    []
  );

  useEffect(() => {
    const updateFromHash = () => {
      const raw = typeof window !== "undefined" ? window.location.hash : "";
      const hash = raw.replace("#", "");

      if (hash && sections.some((s) => s.id === hash)) {
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
  }, [sections]);

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
    if (activeId && currentHash !== activeId) {
      window.history.pushState(null, "", `#${activeId}`);
    }
  }, [activeId]);

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

  const showGraph =
    activeId === "como-funciona" ||
    activeId === "experiencia" ||
    activeId === "planes" ||
    activeId === "contacto";

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

            {/* Contacto */}
            <NavItem href="#contacto" active={activeId === "contacto"}>
              Contacto
            </NavItem>

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
                      isCenter ? "mx-auto w-full max-w-6xl text-center" : "max-w-xl",
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
                                t.id === howTab
                                  ? "bg-[#993331] text-white shadow-sm"
                                  : "bg-[#993331]/90 text-white/90 hover:bg-[#882d2d] hover:text-white",
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

                    {/* PLANES */}
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

                    {/* ✅ CONTACTO */}
                    {s.id === "contacto" && (
                      <div className="mt-10">
                        <ContactCard />
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
        <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-neutral-600">
          © {new Date().getFullYear()} GOKAI — Aprende japonés con IA.
        </div>
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

function ContactCard() {
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
            Tu aprendizaje es nuestra prioridad. Si tienes alguna pregunta o sugerencia, estamos aquí para ayudarte.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex items-start gap-4">
            <IconPhone />
            <div className="text-left">
              <p className="text-lg font-extrabold text-neutral-900">Teléfono</p>
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
          <p className="text-xl font-extrabold text-neutral-900">Redes sociales</p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <SocialBadge><IconTwitter /></SocialBadge>
            <SocialBadge><IconInstagram /></SocialBadge>
            <SocialBadge><IconFacebook /></SocialBadge>
            <SocialBadge><IconWhatsApp /></SocialBadge>
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#993331] shadow-sm ring-1 ring-black/10">
      <div className="text-white">{children}</div>
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

/* ICONS */

function IconPhone() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M7.2 3.6c.5-1 1.7-1.4 2.7-.9l2 1c.9.5 1.3 1.6.9 2.6l-.8 2c-.2.5-.1 1.1.3 1.5l3.5 3.5c.4.4 1 .5 1.5.3l2-.8c1-.4 2.1 0 2.6.9l1 2c.5 1 .1 2.2-.9 2.7l-1.2.6c-1.2.6-2.6.7-3.9.2-3.2-1.2-6.8-4.5-9.5-7.2C6.6 10.3 3.3 6.7 2.1 3.5c-.5-1.3-.4-2.7.2-3.9L2.9 2c.5-1 1.7-1.4 2.7-.9l1.6.8Z"
          stroke="#993331"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function IconMail() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white ring-1 ring-black/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 6.5h16c.8 0 1.5.7 1.5 1.5v10c0 .8-.7 1.5-1.5 1.5H4c-.8 0-1.5-.7-1.5-1.5V8c0-.8.7-1.5 1.5-1.5Z"
          stroke="#993331"
          strokeWidth="1.8"
        />
        <path
          d="M4 8l8 6 8-6"
          stroke="#993331"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function IconTwitter() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.5 7.2c-.7.3-1.4.5-2.2.6.8-.5 1.3-1.2 1.6-2.1-.7.4-1.5.7-2.4.9a3.7 3.7 0 0 0-6.4 2.5c0 .3 0 .6.1.9A10.5 10.5 0 0 1 3.4 6.4a3.7 3.7 0 0 0 1.1 5c-.6 0-1.1-.2-1.6-.4v.1c0 1.8 1.3 3.3 3 3.7-.3.1-.7.1-1 .1-.2 0-.5 0-.7-.1.5 1.6 2 2.7 3.7 2.8A7.4 7.4 0 0 1 2.5 19c1.7 1.1 3.7 1.7 5.9 1.7 7.1 0 11-6 11-11.1v-.5c.8-.6 1.4-1.2 1.9-1.9Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.2 3.8h9.6A3.4 3.4 0 0 1 20.2 7.2v9.6a3.4 3.4 0 0 1-3.4 3.4H7.2a3.4 3.4 0 0 1-3.4-3.4V7.2a3.4 3.4 0 0 1 3.4-3.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 16.2A4.2 4.2 0 1 0 12 7.8a4.2 4.2 0 0 0 0 8.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M17.5 6.8h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.8 21v-7h2.3l.4-2.7h-2.7V9.6c0-.8.2-1.3 1.4-1.3h1.5V6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v1.4H8v2.7h2.4v7h3.4Z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11.9A8 8 0 0 1 8.5 19l-2.9.9 1-2.8A8 8 0 1 1 20 11.9Zm-4.5 3.1c-.2-.1-1.2-.6-1.4-.7-.2-.1-.3-.1-.5.1l-.6.7c-.1.2-.2.2-.4.1a6.6 6.6 0 0 1-2-1.2 7.5 7.5 0 0 1-1.4-1.8c-.1-.2 0-.3.1-.4l.4-.5c.1-.1.1-.3.2-.4 0-.1 0-.3 0-.4 0-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.4c-.1 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 4 3.5.6.3 1 .4 1.4.5.6.2 1.1.2 1.5.1.5-.1 1.2-.5 1.4-1 .2-.5.2-.9.1-1 0-.1-.2-.2-.4-.3Z" />
    </svg>
  );
}