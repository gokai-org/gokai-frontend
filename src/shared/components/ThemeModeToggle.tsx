"use client";

import { useEffect, useState } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "@/shared/hooks/useTheme";

interface ThemeModeToggleProps {
  className?: string;
}

export function ThemeModeToggle({ className }: ThemeModeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const isDark = mounted && theme === "dark";

  const hasExplicitPosition =
    typeof className === "string" &&
    /(^|\s)(static|fixed|absolute|relative|sticky)(?=\s|$)/.test(className);

  const positionClass = hasExplicitPosition ? "" : "relative";

  const baseClass = [
    positionClass,
    "inline-flex h-8 w-14 items-center rounded-full border border-border-default/60 bg-surface-primary/74 p-1 text-content-primary shadow-[var(--shadow-sm)] backdrop-blur-md transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/25 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary",
    className ?? "",
  ].join(" ");

  if (!mounted) {
    return (
      <button type="button" disabled aria-label="Tema" className={baseClass} />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      aria-pressed={isDark}
      className={baseClass}
    >
      <span
        className={[
          "absolute left-1.5 flex h-5 w-5 items-center justify-center transition-opacity duration-300",
          isDark ? "opacity-35" : "opacity-70",
        ].join(" ")}
      >
        <SunMedium className="h-3.5 w-3.5" />
      </span>

      <span
        className={[
          "absolute right-1.5 flex h-5 w-5 items-center justify-center transition-opacity duration-300",
          isDark ? "opacity-70" : "opacity-35",
        ].join(" ")}
      >
        <MoonStar className="h-3.5 w-3.5" />
      </span>

      <span
        className={[
          "absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-[var(--shadow-sm)] transition-transform duration-300",
          isDark ? "translate-x-6" : "translate-x-0",
        ].join(" ")}
      >
        {isDark ? (
          <MoonStar className="h-3 w-3" />
        ) : (
          <SunMedium className="h-3 w-3" />
        )}
      </span>
    </button>
  );
}
