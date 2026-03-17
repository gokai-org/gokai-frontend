"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface LandingNavItemProps {
  id: string;
  href: string;
  active?: boolean;
  children: ReactNode;
}

export function LandingNavItem({
  href,
  active = false,
  children,
}: LandingNavItemProps) {
  return (
    <Link
      href={href}
      className={[
        "relative inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300",
        active ? "text-[#993331]" : "text-neutral-700 hover:text-neutral-950",
      ].join(" ")}
    >
      {active && (
        <motion.span
          layoutId="landing-nav-active"
          className="absolute inset-0 rounded-full bg-white shadow-sm ring-1 ring-black/5"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </Link>
  );
}