"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useSidebar } from "@/shared/components/SidebarContext";

const TABS = [
  { label: "Explorar", href: "/dashboard/graph" },
  { label: "Gramática", href: "/dashboard/graph/grammar" },
  { label: "Kanjis", href: "/dashboard/graph/kanjis" },
] as const;

export default function GraphNavBar() {
  const pathname = usePathname();
  const { hidden } = useSidebar();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={hidden ? { y: -20, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={hidden ? { duration: 0.2 } : { delay: 0.2 }}
        className={`flex gap-2 bg-surface-primary/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-border-subtle ${
          hidden ? "pointer-events-none" : "pointer-events-auto"
        }`}
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
                ${
                  isActive
                    ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/30"
                    : "text-content-secondary hover:bg-surface-tertiary"
                }
              `}
            >
              {tab.label}
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
