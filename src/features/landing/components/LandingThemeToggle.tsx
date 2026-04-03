"use client";

import { ThemeModeToggle } from "@/shared/components/ThemeModeToggle";

interface LandingThemeToggleProps {
  className?: string;
}

export function LandingThemeToggle({
  className,
}: LandingThemeToggleProps) {
  return <ThemeModeToggle className={className} />;
}