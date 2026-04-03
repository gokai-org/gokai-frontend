"use client";

import { motion } from "framer-motion";

interface LandingNavItemProps {
  id: string;
  href: string;
  active?: boolean;
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export function LandingNavItem({
  href,
  active = false,
  children,
  onClick,
}: LandingNavItemProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={[
        "relative inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-300",
        active
          ? "text-accent"
          : "text-content-secondary hover:text-content-primary",
      ].join(" ")}
    >
      {active && (
        <motion.span
          layoutId="landing-nav-pill"
          className="absolute inset-0 rounded-full border border-border-default/70 bg-surface-primary shadow-[var(--shadow-sm)]"
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 30,
            mass: 0.9,
          }}
        />
      )}

      <span className="relative z-10">{children}</span>
    </a>
  );
}