"use client";

import { memo } from "react";
import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { KanjiBoardQualityProfile } from "../types";

interface KanjiBoardBackgroundProps {
  qualityProfile: KanjiBoardQualityProfile;
  graphicsProfile: GraphicsProfile;
  unlockReady?: boolean;
  unlockPending?: boolean;
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const KanjiBoardBackground = memo(
  function KanjiBoardBackground({
    qualityProfile,
    graphicsProfile,
    unlockReady = false,
    unlockPending = false,
  }: KanjiBoardBackgroundProps) {
    const showStars = graphicsProfile.maxBackgroundEffects >= 2;
    const showAtmosphere = graphicsProfile.maxBackgroundEffects >= 3;
    const animateStars =
      graphicsProfile.shouldAnimateBackground &&
      qualityProfile.background.animateTwinkle;
    const animateBreathe =
      graphicsProfile.shouldAnimateBackground &&
      qualityProfile.background.animateBreathe;

    return (
      <div
        className="absolute inset-0 pointer-events-none kanji-bg-scene"
        aria-hidden="true"
      >
        {/* Static base  */}
        <div className="absolute inset-0 kanji-bg-base" />

        {/* Single parallax star tile */}
        {showStars ? (
          <div
            className={cn(
              "kanji-bg-parallax-layer",
              animateStars && "kanji-bg-animate",
            )}
          />
        ) : null}

        {/* Atmospheric depth */}
        {showAtmosphere ? (
          <div
            className={cn(
              "absolute inset-0 kanji-bg-atmosphere",
              animateBreathe && "kanji-bg-breathe",
            )}
          />
        ) : null}

        {unlockReady ? (
          <div
            className={cn(
              "absolute inset-0 kanji-bg-unlock-alert",
              unlockPending && "kanji-bg-unlock-alert-pending",
            )}
          />
        ) : null}

        {unlockReady && qualityProfile.allowMotion ? (
          <div
            className={cn(
              "absolute inset-[-8%] kanji-bg-unlock-sweep",
              unlockPending && "kanji-bg-unlock-sweep-pending",
            )}
          />
        ) : null}

        {/* Edge vignette */}
        <div className="absolute inset-0 kanji-bg-vignette" />
      </div>
    );
  },
  (prev, next) =>
    prev.qualityProfile.tier === next.qualityProfile.tier &&
    prev.qualityProfile.background.animateTwinkle ===
      next.qualityProfile.background.animateTwinkle &&
    prev.qualityProfile.background.animateBreathe ===
      next.qualityProfile.background.animateBreathe &&
    prev.unlockReady === next.unlockReady &&
    prev.unlockPending === next.unlockPending &&
    prev.graphicsProfile.shouldAnimateBackground ===
      next.graphicsProfile.shouldAnimateBackground &&
    prev.graphicsProfile.maxBackgroundEffects ===
      next.graphicsProfile.maxBackgroundEffects,
);
