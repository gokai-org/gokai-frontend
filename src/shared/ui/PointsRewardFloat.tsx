"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

interface PointsRewardFloatProps {
  /** Cantidad de puntos a mostrar. Si es 0 o null no se renderiza. */
  points: number | null;
  /** Texto secundario opcional (ej. "Lección completada"). */
  caption?: string;
  /** Tono visual: "reward" (rojo+oro) | "gold" (oro masterizado). Default: reward. */
  tone?: "reward" | "gold";
  /** Se invoca cuando termina la animación y debe limpiarse el estado. */
  onComplete: () => void;
  /** Duración total visible (ms). Default: 1900. */
  durationMs?: number;
}

/**
 * Insignia flotante reutilizable que celebra la obtención de puntos.
 * Pensada para anclarse al centro del tablero (Grammar / Kanji) tras
 * completar una lección. Usa misma paleta y tipografía que el resto
 * del sistema para mantener consistencia visual.
 */
export function PointsRewardFloat({
  points,
  caption,
  tone = "reward",
  onComplete,
  durationMs = 1900,
}: PointsRewardFloatProps) {
  const isVisible = typeof points === "number" && points > 0;

  useEffect(() => {
    if (!isVisible) return;
    const id = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, isVisible, onComplete]);

  const palette =
    tone === "gold"
      ? {
          bg: "bg-gradient-to-br from-[#F0D27A] via-[#E2B85C] to-[#B8922E]",
          shadow: "shadow-[0_18px_44px_rgba(212,168,67,0.45)]",
          ring: "ring-2 ring-[#F0D27A]/55",
          icon: "text-[#7A5A12]",
          accent: "text-[#5A3F0A]",
        }
      : {
          bg: "bg-gradient-to-br from-[#C5544D] via-[#BA4845] to-[#993331]",
          shadow: "shadow-[0_18px_44px_rgba(186,72,69,0.45)]",
          ring: "ring-2 ring-white/40",
          icon: "text-white/95",
          accent: "text-white",
        };

  return (
    <AnimatePresence>
      {isVisible ? (
        <motion.div
          key="points-reward-float"
          initial={{ opacity: 0, y: 12, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -28, scale: 0.95 }}
          transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute left-1/2 top-[18%] z-30 -translate-x-1/2"
          aria-live="polite"
        >
          <div
            className={`flex items-center gap-2.5 rounded-full px-5 py-2.5 ${palette.bg} ${palette.shadow} ${palette.ring} backdrop-blur-sm`}
          >
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-white/22 ${palette.icon}`}
            >
              <Sparkles className="h-4 w-4" strokeWidth={2.4} />
            </span>
            <div className="flex flex-col leading-tight">
              <span
                className={`font-extrabold tracking-tight text-[18px] ${palette.accent}`}
              >
                +{points} puntos
              </span>
              {caption ? (
                <span
                  className={`text-[11px] font-medium opacity-85 ${palette.accent}`}
                >
                  {caption}
                </span>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default PointsRewardFloat;
