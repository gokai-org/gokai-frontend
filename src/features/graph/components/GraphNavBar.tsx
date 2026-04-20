"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "@/shared/components/SidebarContext";
import WritingSubMenu, { type WritingTab } from "@/features/graph/writing/components/WritingSubMenu";

const MotionLink = motion(Link);

const TABS = [
  { label: "Explorar", href: "/dashboard/graph" },
  { label: "Gramática", href: "/dashboard/graph/grammar" },
  { label: "Escritura", href: "/dashboard/graph/writing" },
] as const;

function isTabActive(pathname: string, href: string) {
  if (href === "/dashboard/graph") return pathname === href;
  return pathname.startsWith(href);
}

export default function GraphNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hidden } = useSidebar();
  const navRef = useRef<HTMLDivElement | null>(null);
  const [writingMenuOpen, setWritingMenuOpen] = useState(false);
  const [pendingWritingTab, setPendingWritingTab] = useState<WritingTab | null>(null);

  const activeWritingTab = useMemo(() => {
    if (!pathname.startsWith("/dashboard/graph/writing")) {
      return null;
    }

    const tab = searchParams.get("tab");
    return tab === "hiragana" || tab === "katakana" || tab === "kanji"
      ? tab
      : null;
  }, [pathname, searchParams]);

  const isWritingPending =
    pendingWritingTab !== null && !pathname.startsWith("/dashboard/graph/writing");
  const displayedWritingTab = activeWritingTab ?? pendingWritingTab;

  const showWritingMenu = writingMenuOpen;

  const handleWritingSelection = useCallback(
    (tab: WritingTab) => {
      setPendingWritingTab(tab);
      setWritingMenuOpen(false);
      router.push(`/dashboard/graph/writing?tab=${tab}`);
    },
    [router],
  );

  useEffect(() => {
    if (!writingMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (navRef.current?.contains(event.target as Node)) return;
      setWritingMenuOpen(false);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [writingMenuOpen]);

  return (
    <div
      ref={navRef}
      data-help-target="graph-nav"
      data-zoom-exclude="true"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={hidden ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={hidden ? { duration: 0.2 } : { delay: 0.2 }}
        className={`flex gap-1 sm:gap-1.5 md:gap-2 bg-surface-primary/90 backdrop-blur-md rounded-xl p-1 sm:p-1.5 shadow-lg border border-border-subtle max-w-[calc(100vw-2rem)] ${
          hidden ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        {TABS.map((tab) => {
          const isActive = isTabActive(pathname, tab.href);
          const isWriting = tab.href === "/dashboard/graph/writing";
          const isVisuallyActive = isWriting
            ? isActive || writingMenuOpen || isWritingPending
            : isActive && !writingMenuOpen && !isWritingPending;

          return (
            <MotionLink
              key={tab.href}
              href={tab.href}
              {...(isWriting ? { "data-writing-nav-escritura": "true" } : {})}
              onClick={(e) => {
                if (!isWriting) {
                  setPendingWritingTab(null);
                  setWritingMenuOpen(false);
                  return;
                }

                e.preventDefault();

                setWritingMenuOpen((current) => !current);
              }}
              className="relative px-3 py-2 sm:px-5 sm:py-2.5 md:px-8 rounded-lg text-xs sm:text-sm font-semibold transition-colors duration-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {isVisuallyActive && (
                <motion.span
                  layoutId="graph-nav-active"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent to-accent-hover shadow-md shadow-accent/30"
                  transition={{ type: "spring", stiffness: 500, damping: 32 }}
                />
              )}
              <span
                className={`relative z-10 ${
                  isVisuallyActive
                    ? "text-content-inverted"
                    : "text-content-secondary hover:text-content-primary"
                }`}
              >
                {tab.label}
              </span>
            </MotionLink>
          );
        })}
      </motion.div>

      {showWritingMenu && !hidden && (
        <WritingSubMenu
          activeTab={displayedWritingTab}
          onTabChange={handleWritingSelection}
        />
      )}
    </div>
  );
}
