"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LandingNavItemProps {
  id: string;
  href: string;
  active?: boolean;
  children: React.ReactNode;
}

export default function LandingNavItem({
  id,
  href,
  active,
  children,
}: LandingNavItemProps) {
  return (
    <a
      href={href}
      className={[
        "relative py-1 transition-colors",
        active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900",
      ].join(" ")}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.span
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            exit={{ opacity: 0, scaleX: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute -bottom-2 left-0 h-[2px] w-full rounded-full bg-[#993331] origin-center"
          />
        )}
      </AnimatePresence>
    </a>
  );
}
