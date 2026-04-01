"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/shared/components/SidebarContext";

type ItemKey =
  | "mapa"
  | "repaso"
  | "estadisticas"
  | "biblioteca"
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

const ACCENT = "var(--text-primary)";
const MUTED = "var(--text-muted)";

export default function SidebarOnly() {
  const router = useRouter();
  const pathname = usePathname();

  const { setExpanded, hidden: sidebarHidden } = useSidebar();
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 16, y: 16 });
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const items = useMemo<NavItem[]>(
    () => [
      {
        key: "mapa",
        label: "Mapa",
        section: "menu",
        iconInactive: "/icons/mapa.svg",
        iconActive: "/icons/mapa-active.svg",
        href: "/dashboard/graph",
      },
      {
        key: "repaso",
        label: "Repaso",
        section: "menu",
        iconInactive: "/icons/repaso.svg",
        iconActive: "/icons/repaso-active.svg",
        href: "/dashboard/reviews",
      },
      {
        key: "estadisticas",
        label: "Estadísticas",
        section: "menu",
        iconInactive: "/icons/estadisticas.svg",
        iconActive: "/icons/estadisticas-active.svg",
        href: "/dashboard/statistics",
      },
      {
        key: "biblioteca",
        label: "Biblioteca",
        section: "menu",
        iconInactive: "/icons/biblioteca.svg",
        iconActive: "/icons/biblioteca-active.svg",
        href: "/dashboard/library",
      },
      {
        key: "chatbot",
        label: "Chatbot",
        section: "menu",
        iconInactive: "/icons/chatbot_side.svg",
        iconActive: "/icons/chatbot_side-active.svg",
        href: "/dashboard/chatbot",
      },
      {
        key: "avisos",
        label: "Avisos",
        section: "menu",
        iconInactive: "/icons/avisos.svg",
        iconActive: "/icons/avisos-active.svg",
        href: "/dashboard/notices",
      },

      {
        key: "ajustes",
        label: "Ajustes",
        section: "general",
        iconInactive: "/icons/ajustes.svg",
        iconActive: "/icons/ajustes-active.svg",
        href: "/dashboard/configuration",
      },
      {
        key: "ayuda",
        label: "Ayuda",
        section: "general",
        iconInactive: "/icons/ayuda.svg",
        iconActive: "/icons/ayuda-active.svg",
        href: "/dashboard/help",
      },
      {
        key: "logout",
        label: "Cerrar sesión",
        section: "general",
        iconInactive: "/icons/logout.svg",
        iconActive: "/icons/logout-active.svg",
        href: "/",
        danger: true,
      },
    ],
    [],
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
        // Usar window.location.replace para limpiar el historial y evitar volver atrás
        window.location.replace("/auth/login");
      } catch (error) {
        console.error("Error al cerrar sesión:", error);
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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setWasDragged(false);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    dragStart.current = {
      x: clientX - menuPosition.x,
      y: clientY - menuPosition.y,
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setWasDragged(true);
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 64, clientX - dragStart.current.x),
    );
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 64, clientY - dragStart.current.y),
    );

    setMenuPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);

    if (wasDragged) {
      const currentX = menuPosition.x;
      const screenWidth = window.innerWidth;
      const snapToLeft = currentX < screenWidth / 2;

      setMenuPosition({
        x: snapToLeft ? 16 : screenWidth - 64,
        y: menuPosition.y,
      });
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleDragMove);
      window.addEventListener("mouseup", handleDragEnd);
      window.addEventListener("touchmove", handleDragMove);
      window.addEventListener("touchend", handleDragEnd);
      return () => {
        window.removeEventListener("mousemove", handleDragMove);
        window.removeEventListener("mouseup", handleDragEnd);
        window.removeEventListener("touchmove", handleDragMove);
        window.removeEventListener("touchend", handleDragEnd);
      };
    }
  }, [isDragging, menuPosition]);

  return (
    <>
      {/* Botón móvil*/}
      {!mobileOpen && !sidebarHidden && (
        <motion.div
          className="md:hidden fixed z-[60] touch-none"
          style={{
            cursor: isDragging ? "grabbing" : "grab",
          }}
          animate={{
            left: menuPosition.x,
            top: menuPosition.y,
          }}
          transition={{
            type: isDragging ? "tween" : "spring",
            duration: isDragging ? 0 : 0.3,
            stiffness: 300,
            damping: 30,
          }}
        >
          <motion.button
            type="button"
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onClick={(e) => {
              if (!wasDragged) {
                setMobileOpen(true);
              }
            }}
            className="h-12 w-12 rounded-2xl bg-[var(--sidebar-bg)] ring-1 ring-[var(--sidebar-ring)] shadow-[var(--shadow-lg)] backdrop-blur grid place-items-center"
            aria-label="Abrir menú"
            aria-expanded="false"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 7h14"
                stroke="var(--sidebar-icon-stroke)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 12h14"
                stroke="var(--sidebar-icon-stroke)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 17h14"
                stroke="var(--sidebar-icon-stroke)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.button>
        </motion.div>
      )}

      {/* Desktop sidebar */}
      {!sidebarHidden && (
        <div className="hidden md:block fixed left-4 top-4 z-50 h-[calc(100dvh-32px)]">
          <motion.aside
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className={[
              "h-full rounded-[28px] bg-[var(--sidebar-bg)] ring-1 ring-[var(--sidebar-ring)] backdrop-blur",
              "shadow-[var(--shadow-md)]",
              "flex flex-col overflow-hidden",
              "w-[320px] md:w-[78px]",
            ].join(" ")}
            animate={{ width: expanded ? 320 : 78 }}
            transition={{
              type: "spring",
              stiffness: 350,
              damping: 30,
              mass: 0.7,
            }}
          >
            <motion.div animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
              <Header expanded={expanded} />
            </motion.div>

            <nav
              className={[
                "min-h-0 flex-1 pb-3",
                expanded ? "px-3" : "px-0",
                "overflow-y-auto no-scrollbar",
              ].join(" ")}
            >
              <SectionLabel label="MENU" expanded={expanded} />
              <div className="mt-2 space-y-2">
                {items
                  .filter((x) => x.section === "menu")
                  .map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={false}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: expanded ? index * 0.02 : 0,
                        duration: 0.2,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                    >
                      <SidebarItem
                        label={item.label}
                        iconInactive={item.iconInactive}
                        iconActive={item.iconActive}
                        active={isActive(item.href)}
                        danger={!!item.danger}
                        expanded={expanded}
                        onClick={() => onPick(item)}
                      />
                    </motion.div>
                  ))}
              </div>

              <div className="mt-6" />
              <SectionLabel label="GENERAL" expanded={expanded} />
              <div className="mt-2 space-y-2">
                {items
                  .filter((x) => x.section === "general")
                  .map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={false}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{
                        delay: expanded ? 0.16 + index * 0.02 : 0,
                        duration: 0.2,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                    >
                      <SidebarItem
                        label={item.label}
                        iconInactive={item.iconInactive}
                        iconActive={item.iconActive}
                        active={isActive(item.href)}
                        danger={!!item.danger}
                        expanded={expanded}
                        onClick={() => onPick(item)}
                      />
                    </motion.div>
                  ))}
              </div>
            </nav>

            <GlobalStyles />
          </motion.aside>
        </div>
      )}

      {/* Drawer móvil */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="md:hidden fixed inset-0 z-50 bg-surface-overlay backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              onClick={() => setMobileOpen(false)}
            />

            <motion.aside
              className={[
                "md:hidden fixed left-4 top-4 z-[55] h-[calc(100dvh-32px)]",
                "bg-[var(--sidebar-bg)] ring-1 ring-[var(--sidebar-ring)] backdrop-blur",
                "shadow-[var(--shadow-md)]",
                "rounded-[28px] overflow-hidden flex flex-col",
                "w-[calc(86vw-16px)] max-w-[360px]",
              ].join(" ")}
              initial={{ x: -420, opacity: 0, scale: 0.9 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: -420, opacity: 0, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8,
              }}
              style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
              }}
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                className="absolute right-3 top-3 z-10"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.2 }}
              >
                <motion.button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-11 w-11 rounded-2xl bg-[var(--sidebar-bg)] ring-1 ring-[var(--sidebar-ring)] grid place-items-center"
                  aria-label="Cerrar menú"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 6l12 12"
                      stroke="var(--sidebar-icon-stroke)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M18 6 6 18"
                      stroke="var(--sidebar-icon-stroke)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <Header expanded={true} />
              </motion.div>

              <motion.nav
                className="min-h-0 flex-1 pb-3 px-3 overflow-y-auto no-scrollbar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                <SectionLabel label="MENU" expanded={true} />
                <div className="mt-2 space-y-2">
                  {items
                    .filter((x) => x.section === "menu")
                    .map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.2 + index * 0.03,
                          duration: 0.3,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                      >
                        <SidebarItem
                          label={item.label}
                          iconInactive={item.iconInactive}
                          iconActive={item.iconActive}
                          active={isActive(item.href)}
                          danger={!!item.danger}
                          expanded={true}
                          onClick={() => onPick(item)}
                        />
                      </motion.div>
                    ))}
                </div>

                <div className="mt-6" />
                <SectionLabel label="GENERAL" expanded={true} />
                <div className="mt-2 space-y-2">
                  {items
                    .filter((x) => x.section === "general")
                    .map((item, index) => (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.4 + index * 0.03,
                          duration: 0.3,
                          ease: [0.32, 0.72, 0, 1],
                        }}
                      >
                        <SidebarItem
                          label={item.label}
                          iconInactive={item.iconInactive}
                          iconActive={item.iconActive}
                          active={isActive(item.href)}
                          danger={!!item.danger}
                          expanded={true}
                          onClick={() => onPick(item)}
                        />
                      </motion.div>
                    ))}
                </div>
              </motion.nav>

              <GlobalStyles />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .jp-vertical {
        writing-mode: vertical-rl;
        text-orientation: upright;
        line-height: 1;
      }
    `}</style>
  );
}

function Header({ expanded }: { expanded: boolean }) {
  return (
    <div className="pt-4 pb-0">
      <div className={[expanded ? "px-4" : "px-2"].join(" ")}>
        <div
          className={[
            "flex items-center",
            expanded ? "gap-3" : "justify-center",
          ].join(" ")}
        >
          {/*
           * Dos imágenes controladas por CSS. El script inline en layout.tsx
           * ya aplica la clase `dark` en <html> antes de que React hidrate,
           * así que Tailwind dark: resuelve el logo correcto desde el primer
           * frame sin depender del estado React (que causa el destello).
           */}
          <div className="relative h-10 w-10 shrink-0">
            <motion.img
              src="/logos/gokai-logo.svg"
              alt="Gokai"
              draggable={false}
              className="absolute inset-0 select-none h-10 w-10 block dark:hidden"
              initial={false}
              animate={{ rotate: expanded ? 180 : -180 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            />
            <motion.img
              src="/logos/gokai-logo-dark.svg"
              alt="Gokai"
              draggable={false}
              className="absolute inset-0 select-none h-10 w-10 hidden dark:block"
              initial={false}
              animate={{ rotate: expanded ? 180 : -180 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            />
          </div>

          {expanded && (
            <div className="hidden md:block">
              <div className="flex items-center gap-4">
                <div className="text-[28px] font-extrabold tracking-[0.09em] text-content-primary leading-none">
                  GOKAI
                </div>
                <span className="jp-vertical text-[13px] font-black text-content-secondary dark:text-content-tertiary select-none" style={{ lineHeight: 1.15 }}>
                  語界
                </span>
              </div>
            </div>
          )}

          <div className="md:hidden">
            <div className="text-[28px] font-extrabold tracking-[0.06em] text-content-primary leading-none">
              GOKAI
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-border-default" />
    </div>
  );
}

function SectionLabel({
  label,
  expanded,
}: {
  label: string;
  expanded: boolean;
}) {
  return (
    <div
      className="px-3 pt-2 text-[11px] font-semibold tracking-[0.24em] text-content-muted"
      style={{ opacity: expanded ? 1 : 0 }}
    >
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
  const accentBg = danger ? "rgba(220,38,38,0.10)" : "var(--accent-subtle)";
  const hoverBg = danger ? "rgba(220,38,38,0.08)" : "var(--accent-muted)";
  const textColor = active ? (danger ? "rgb(220,38,38)" : ACCENT) : MUTED;
  const iconSrc = active ? iconActive : iconInactive;

  if (!expanded) {
    return (
      <motion.button
        type="button"
        onClick={onClick}
        className="group relative w-full flex items-center justify-center rounded-2xl h-14 px-0"
        aria-label={label}
        title={label}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {active && (
          <div
            className="absolute inset-0 rounded-2xl"
            style={{ background: accentBg }}
          />
        )}
        {active && (
          <motion.div
            className="absolute left-0 top-1/2 h-10 w-3 -translate-y-1/2 rounded-r-full"
            style={{ background: "var(--accent)" }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          />
        )}
        <motion.img
          src={iconSrc}
          alt=""
          draggable={false}
          className="relative h-[24px] w-[24px] object-contain opacity-90 group-hover:opacity-100"
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.3 }}
        />
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: hoverBg, pointerEvents: "none" }}
        />
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="group relative w-full flex items-center gap-4 rounded-2xl h-14 px-4 ring-1 ring-transparent hover:ring-[var(--sidebar-ring)] transition-colors"
      style={{ background: active ? accentBg : "transparent" }}
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="grid h-11 w-11 place-items-center">
        <motion.img
          src={iconSrc}
          alt=""
          draggable={false}
          className="h-[24px] w-[24px] object-contain opacity-90 group-hover:opacity-100"
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        />
      </div>

      <motion.span
        className="block whitespace-nowrap text-[18px] font-semibold tracking-normal"
        style={{ color: textColor }}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {label}
      </motion.span>

      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: hoverBg, pointerEvents: "none" }}
      />
      {active && (
        <motion.div
          className="absolute -left-3 top-1/2 h-10 w-3 -translate-y-1/2 rounded-r-full"
          style={{ background: "var(--accent)" }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
      )}
    </motion.button>
  );
}
