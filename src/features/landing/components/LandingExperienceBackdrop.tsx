"use client";

import { LandingExperienceBackground } from "@/features/landing/components/LandingExperienceBackground";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
  return x * x * (3 - 2 * x);
}

interface LandingExperienceBackdropProps {
  activeId: string;
  experienceProgress: number;
  exitProgress?: number;
}

export function LandingExperienceBackdrop({
  activeId,
  experienceProgress,
  exitProgress = 0,
}: LandingExperienceBackdropProps) {
  const isAfterExperience =
    activeId === "experiencia" ||
    activeId === "planes" ||
    activeId === "contacto";

  // Siempre smooth — sin snap a 1 cuando cambia activeId
  const reveal = smoothstep(0.06, 0.88, experienceProgress);
  const opacity = smoothstep(0.04, 0.24, experienceProgress);

  // Fade-out suave al entrar en la sección de planes
  const exitCurve = smoothstep(0, 1, exitProgress);
  const finalOpacity = opacity * (1 - exitCurve);

  const visible = (isAfterExperience || experienceProgress > 0.01) && finalOpacity > 0.004;

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] overflow-hidden"
      aria-hidden="true"
      style={{ opacity: finalOpacity }}
    >
      <LandingExperienceBackground progress={reveal} />
    </div>
  );
}