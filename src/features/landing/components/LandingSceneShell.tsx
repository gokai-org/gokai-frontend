"use client";

import { LandingSceneCanvas } from "@/features/landing/components/LandingSceneCanvas";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
  return x * x * (3 - 2 * x);
}

interface LandingSceneShellProps {
  sectionIds: string[];
  activeId: string;
  experienceProgress: number;
}

export function LandingSceneShell({
  sectionIds,
  activeId,
  experienceProgress,
}: LandingSceneShellProps) {
  const isAfterExperience =
    activeId === "experiencia" ||
    activeId === "planes" ||
    activeId === "contacto";

  const fade = isAfterExperience
    ? 1
    : smoothstep(0.26, 0.72, experienceProgress);

  const graphOpacity = 1 - fade;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ opacity: graphOpacity }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--surface-primary)_0%,var(--surface-secondary)_100%)] opacity-10" />
      <LandingSceneCanvas sectionIds={sectionIds} />
    </div>
  );
}
