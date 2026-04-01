"use client";

import { memo } from "react";
import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { KanjiConstellationQualityProfile } from "../types";

interface KanjiConstellationBackgroundProps {
  qualityProfile: KanjiConstellationQualityProfile;
  graphicsProfile: GraphicsProfile;
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const KanjiConstellationBackground = memo(
  function KanjiConstellationBackground({
    qualityProfile,
    graphicsProfile,
  }: KanjiConstellationBackgroundProps) {
    // Stars visible from medium tier upward
    const showStars = graphicsProfile.maxBackgroundEffects >= 2;
    // Atmospheric depth visible on high tier only
    const showAtmosphere = graphicsProfile.maxBackgroundEffects >= 3;
    // Animate star layer: high tier with background animations enabled
    const animateStars =
      graphicsProfile.shouldAnimateBackground && qualityProfile.background.animateTwinkle;
    // Breathe atmosphere: high tier with heavy effects only
    const animateBreathe =
      graphicsProfile.shouldAnimateBackground && qualityProfile.background.animateBreathe;

    return (
      <div
        className="absolute inset-0 pointer-events-none kanji-bg-scene"
        aria-hidden="true"
      >
        {/* Static base — paint only, no compositor promotion */}
        <div className="absolute inset-0 kanji-bg-base" />

        {/* Single parallax star tile — sole compositor-promoted layer */}
        {showStars ? (
          <div
            className={cn(
              "kanji-bg-parallax-layer",
              animateStars && "kanji-bg-animate",
            )}
          />
        ) : null}

        {/* Atmospheric depth — static radial gradient, no will-change */}
        {showAtmosphere ? (
          <div
            className={cn(
              "absolute inset-0 kanji-bg-atmosphere",
              animateBreathe && "kanji-bg-breathe",
            )}
          />
        ) : null}

        {/* Edge vignette — static, no compositor promotion */}
        <div className="absolute inset-0 kanji-bg-vignette" />
      </div>
    );
  },
  // Only re-render when visually relevant properties change.
  // Camera profile changes on resize do NOT affect background visuals.
  (prev, next) =>
    prev.qualityProfile.tier === next.qualityProfile.tier &&
    prev.qualityProfile.background.animateTwinkle === next.qualityProfile.background.animateTwinkle &&
    prev.qualityProfile.background.animateBreathe === next.qualityProfile.background.animateBreathe &&
    prev.graphicsProfile.shouldAnimateBackground === next.graphicsProfile.shouldAnimateBackground &&
    prev.graphicsProfile.maxBackgroundEffects === next.graphicsProfile.maxBackgroundEffects,
);

