"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const TABS = [
  { label: "Explorar", href: "/dashboard/graph" },
  { label: "Gramática", href: "/dashboard/graph/grammar" },
  { label: "Kanjis", href: "/dashboard/graph/kanjis" },
] as const;

export default function GraphNavBar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 bg-surface-primary/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-border-subtle pointer-events-auto"
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
