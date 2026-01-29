"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/components/navigation/sidebar-context";

type ItemKey =
  | "mapa"
  | "descubrir"
  | "repaso"
  | "estadisticas"
  | "biblioteca"
  | "favoritos"
  | "chatbot"
  | "avisos"
  | "ajustes"
  | "ayuda"
  | "logout";

type NavItem = {
  key: ItemKey;
  label: string;
  section: "menu" | "general";
  iconInactive: string;
  iconActive: string;
  href: string;
  danger?: boolean;
};

const ACCENT = "#1C1C1C";
const MUTED = "rgba(0,0,0,0.38)";

export default function SidebarOnly() {
  const router = useRouter();
  const pathname = usePathname();

  const { setExpanded } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { key: "mapa", label: "Mapa", section: "menu", iconInactive: "/icons/mapa.svg", iconActive: "/icons/mapa-active.svg", href: "/dashboard/graph" },
      { key: "descubrir", label: "Descubrir", section: "menu", iconInactive: "/icons/descubrir.svg", iconActive: "/icons/descubrir-active.svg", href: "/dashboard/discover" },
      { key: "repaso", label: "Repaso", section: "menu", iconInactive: "/icons/repaso.svg", iconActive: "/icons/repaso-active.svg", href: "/dashboard/reviews" },
      { key: "estadisticas", label: "Estadísticas", section: "menu", iconInactive: "/icons/estadisticas.svg", iconActive: "/icons/estadisticas-active.svg", href: "/dashboard/statistics" },
      { key: "biblioteca", label: "Biblioteca", section: "menu", iconInactive: "/icons/biblioteca.svg", iconActive: "/icons/biblioteca-active.svg", href: "/dashboard/library" },
      { key: "favoritos", label: "Favoritos", section: "menu", iconInactive: "/icons/favoritos.svg", iconActive: "/icons/favoritos-active.svg", href: "/dashboard/favorites" },
      { key: "chatbot", label: "Chatbot", section: "menu", iconInactive: "/icons/chatbot_side.svg", iconActive: "/icons/chatbot_side-active.svg", href: "/dashboard/chatbot" },
      { key: "avisos", label: "Avisos", section: "menu", iconInactive: "/icons/avisos.svg", iconActive: "/icons/avisos-active.svg", href: "/dashboard/notices" },

      { key: "ajustes", label: "Ajustes", section: "general", iconInactive: "/icons/ajustes.svg", iconActive: "/icons/ajustes-active.svg", href: "/dashboard/configuration" },
      { key: "ayuda", label: "Ayuda", section: "general", iconInactive: "/icons/ayuda.svg", iconActive: "/icons/ayuda-active.svg", href: "/dashboard/help" },
      { key: "logout", label: "Cerrar sesión", section: "general", iconInactive: "/icons/logout.svg", iconActive: "/icons/logout-active.svg", href: "/", danger: true },
    ],
    []
  );

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + "/");
  };

const [loggingOut, setLoggingOut] = useState(false);

  const onPick = async (item: NavItem) => {
    setMobileOpen(false);

    if (item.key === "logout") {
      if (loggingOut) return;
      setLoggingOut(true);

      try {
        await fetch("/api/auth/logout", { method: "POST" });
      } finally {
        router.replace("/auth/login");
        router.refresh();
        setLoggingOut(false);
      }
      return;
    }

    if (pathname !== item.href) router.push(item.href);
  };


  const expanded = hovered;
  
  useEffect(() => {
    setExpanded(expanded);
  }, [expanded, setExpanded]);
  
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-[100dvh] bg-transparent">
      {/* Botón móvil*/}
      {!mobileOpen && (
        <div className="md:hidden fixed left-4 top-4 z-[60]">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="h-12 w-12 rounded-2xl bg-white/95 ring-1 ring-black/5 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur grid place-items-center"
            aria-label="Abrir menú"
            aria-expanded="false"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M5 7h14" stroke="rgba(0,0,0,0.65)" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 12h14" stroke="rgba(0,0,0,0.65)" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 17h14" stroke="rgba(0,0,0,0.65)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block fixed left-4 top-4 z-50 h-[calc(100dvh-32px)]">
        <motion.aside
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={[
            "h-full rounded-[28px] bg-white/95 ring-1 ring-black/5 backdrop-blur",
            "shadow-[0_20px_70px_rgba(0,0,0,0.18)]",
            "flex flex-col overflow-hidden",
            "w-[320px] md:w-[78px]",
          ].join(" ")}
          animate={{ width: expanded ? 320 : 78 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
        >
          <Header expanded={expanded} />

          <nav className={["min-h-0 flex-1 pb-3", expanded ? "px-3" : "px-0", "overflow-y-auto no-scrollbar"].join(" ")}>
            <SectionLabel label="MENU" expanded={expanded} />
            <div className="mt-2 space-y-2">
              {items.filter((x) => x.section === "menu").map((item) => (
                <SidebarItem
                  key={item.key}
                  label={item.label}
                  iconInactive={item.iconInactive}
                  iconActive={item.iconActive}
                  active={isActive(item.href)}
                  danger={!!item.danger}
                  expanded={expanded}
                  onClick={() => onPick(item)}
                />
              ))}
            </div>

            <div className="mt-6" />
            <SectionLabel label="GENERAL" expanded={expanded} />
            <div className="mt-2 space-y-2">
              {items.filter((x) => x.section === "general").map((item) => (
                <SidebarItem
                  key={item.key}
                  label={item.label}
                  iconInactive={item.iconInactive}
                  iconActive={item.iconActive}
                  active={isActive(item.href)}
                  danger={!!item.danger}
                  expanded={expanded}
                  onClick={() => onPick(item)}
                />
              ))}
            </div>
          </nav>

          <GlobalStyles />
        </motion.aside>
      </div>

      {/* Drawer móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-black/35"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              className={[
                "md:hidden fixed left-4 top-4 z-[55] h-[calc(100dvh-32px)]",
                "bg-white/96 ring-1 ring-black/5 backdrop-blur",
                "shadow-[0_30px_90px_rgba(0,0,0,0.25)]",
                "rounded-[28px] overflow-hidden flex flex-col",
                "w-[calc(86vw-16px)] max-w-[360px]",
              ].join(" ")}
              initial={{ x: -420 }}
              animate={{ x: 0 }}
              exit={{ x: -420 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
              role="dialog"
              aria-modal="true"
            >
              <div className="absolute right-3 top-3 z-10">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-11 w-11 rounded-2xl bg-white/70 ring-1 ring-black/5 grid place-items-center"
                  aria-label="Cerrar menú"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M6 6l12 12" stroke="rgba(0,0,0,0.65)" strokeWidth="2" strokeLinecap="round" />
                    <path d="M18 6 6 18" stroke="rgba(0,0,0,0.65)" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <Header expanded={true} />

              <nav className="min-h-0 flex-1 pb-3 px-3 overflow-y-auto no-scrollbar">
                <SectionLabel label="MENU" expanded={true} />
                <div className="mt-2 space-y-2">
                  {items.filter((x) => x.section === "menu").map((item) => (
                    <SidebarItem
                      key={item.key}
                      label={item.label}
                      iconInactive={item.iconInactive}
                      iconActive={item.iconActive}
                      active={isActive(item.href)}
                      danger={!!item.danger}
                      expanded={true}
                      onClick={() => onPick(item)}
                    />
                  ))}
                </div>

                <div className="mt-6" />
                <SectionLabel label="GENERAL" expanded={true} />
                <div className="mt-2 space-y-2">
                  {items.filter((x) => x.section === "general").map((item) => (
                    <SidebarItem
                      key={item.key}
                      label={item.label}
                      iconInactive={item.iconInactive}
                      iconActive={item.iconActive}
                      active={isActive(item.href)}
                      danger={!!item.danger}
                      expanded={true}
                      onClick={() => onPick(item)}
                    />
                  ))}
                </div>
              </nav>

              <GlobalStyles />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      .no-scrollbar::-webkit-scrollbar { display: none; }
      .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      .jp-vertical { writing-mode: vertical-rl; text-orientation: upright; line-height: 1; }
    `}</style>
  );
}

function Header({ expanded }: { expanded: boolean }) {
  return (
    <div className={["pt-4 pb-3", expanded ? "px-4" : "px-2"].join(" ")}>
      <div className={["flex items-center", expanded ? "gap-3" : "justify-center"].join(" ")}>
        <motion.img
          src="/icons/logo-gokai.svg"
          alt="Gokai"
          draggable={false}
          className="select-none h-10 w-10"
          initial={false}
          animate={{ rotate: expanded ? 180 : -180 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        />

        {expanded && (
          <div className="hidden md:block">
            <div className="flex items-start gap-3">
              <div>
                <div className="text-[28px] font-extrabold tracking-[0.06em] text-neutral-900 leading-none">GOKAI</div>
              </div>
              <span className="jp-vertical text-[12px] font-black text-neutral-700 select-none">語界</span>
            </div>
          </div>
        )}

        <div className="md:hidden">
          <div className="text-[28px] font-extrabold tracking-[0.06em] text-neutral-900 leading-none">GOKAI</div>
        </div>
      </div>

      <div className={["mt-3 h-px w-full bg-black/5", expanded ? "" : "mx-2"].join(" ")} />
    </div>
  );
}

function SectionLabel({ label, expanded }: { label: string; expanded: boolean }) {
  return (
    <div className="px-3 pt-2 text-[11px] font-semibold tracking-[0.24em] text-neutral-400" style={{ opacity: expanded ? 1 : 0 }}>
      {label}
    </div>
  );
}

function SidebarItem({
  label,
  iconInactive,
  iconActive,
  active,
  danger,
  expanded,
  onClick,
}: {
  label: string;
  iconInactive: string;
  iconActive: string;
  active: boolean;
  danger: boolean;
  expanded: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const accentBg = danger ? "rgba(220,38,38,0.10)" : "rgba(153,51,49,0.10)";
  const hoverBg = danger ? "rgba(220,38,38,0.08)" : "rgba(153,51,49,0.07)";
  const textColor = active ? (danger ? "rgb(220,38,38)" : ACCENT) : MUTED;
  const iconSrc = active ? iconActive : iconInactive;
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="group relative w-full flex items-center justify-center rounded-2xl h-14 px-0"
        aria-label={label}
        title={label}
      >
        {active && <div className="absolute inset-0 rounded-2xl" style={{ background: accentBg }} />}
        {active && <div className="absolute left-0 top-1/2 h-10 w-3 -translate-y-1/2 rounded-r-full" style={{ background: "#993331" }} />}
        <img src={iconSrc} alt="" draggable={false} className="relative h-[24px] w-[24px] object-contain opacity-90 group-hover:opacity-100" />
        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: hoverBg, pointerEvents: "none" }} />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-full flex items-center gap-4 rounded-2xl h-14 px-4 ring-1 ring-transparent hover:ring-black/5 transition-colors"
      style={{ background: active ? accentBg : "transparent" }}
    >
      <div className="grid h-11 w-11 place-items-center">
        <img src={iconSrc} alt="" draggable={false} className="h-[24px] w-[24px] object-contain opacity-90 group-hover:opacity-100" />
      </div>

      <span className="block whitespace-nowrap text-[18px] font-semibold tracking-normal" style={{ color: textColor }}>
        {label}
      </span>

      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: hoverBg, pointerEvents: "none" }} />
      {active && <div className="absolute -left-3 top-1/2 h-10 w-3 -translate-y-1/2 rounded-r-full" style={{ background: "#993331" }} />}
    </button>
  );
}