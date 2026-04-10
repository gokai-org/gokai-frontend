"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { CelebrationPhase } from "../types";

// ---------------------------------------------------------------------------
// Cinematic overlay — dims the scene and suppresses interaction during
// the celebration sequence.
// ---------------------------------------------------------------------------

interface MasteryOverlayProps {
  phase: CelebrationPhase;
  /** Controls golden backdrop intensity (0–1). */
  propagationProgress: number;
}

/**
 * Full-viewport overlay rendered on top of the board during celebrations.
 *
 * - `cinematic_enter`: fades in a dark veil + subtle golden vignette.
 * - `golden_propagation`: intensifies the golden backdrop.
 * - `camera_tour`: maintains the cinematic veil.
 * - `cinematic_exit`: fades everything out.
 * - `idle` / `modal`: hidden (modal has its own backdrop).
 */
export const MasteryOverlay = memo(function MasteryOverlay({
  phase,
  propagationProgress,
}: MasteryOverlayProps) {
  const isVisible =
    phase === "cinematic_enter" ||
    phase === "golden_propagation" ||
    phase === "camera_tour" ||
    phase === "cinematic_exit";

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="mastery-overlay"
          className="mastery-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            pointerEvents: "all",
            background:
              phase === "golden_propagation" || phase === "camera_tour"
                ? `radial-gradient(
                    ellipse 80% 60% at 50% 50%,
                    rgba(212, 168, 67, ${(0.08 * propagationProgress).toFixed(3)}) 0%,
                    rgba(0, 0, 0, ${(0.55 + 0.15 * propagationProgress).toFixed(3)}) 100%
                  )`
                : "rgba(0, 0, 0, 0.55)",
          }}
          aria-hidden="true"
        >
          {/* Golden particles during propagation */}
          {(phase === "golden_propagation" || phase === "camera_tour") && (
            <div
              className="mastery-golden-particles"
              style={{
                opacity: propagationProgress,
              }}
            />
          )}

          {/* Edge vignette with golden subtlety */}
          <div
            className="absolute inset-0 mastery-vignette"
            style={{
              opacity: phase === "cinematic_exit" ? 0 : 1,
              transition: "opacity 0.5s ease-out",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
