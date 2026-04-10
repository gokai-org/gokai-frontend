"use client";

import { memo } from "react";
import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { WritingBoardQualityProfile, WritingScriptType } from "../types";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const WritingBoardBackground = memo(
  function WritingBoardBackground({
    qualityProfile,
    graphicsProfile,
    scriptType = "kanji",
  }: {
    qualityProfile: WritingBoardQualityProfile;
    graphicsProfile: GraphicsProfile;
    scriptType?: WritingScriptType;
  }) {
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
        data-script={scriptType}
        aria-hidden="true"
      >
        <div className="absolute inset-0 kanji-bg-base" />

        {showStars ? (
          <div
            className={cn(
              "kanji-bg-parallax-layer",
              animateStars && "kanji-bg-animate",
            )}
          />
        ) : null}

        {showAtmosphere ? (
          <div
            className={cn(
              "absolute inset-0 kanji-bg-atmosphere",
              animateBreathe && "kanji-bg-breathe",
            )}
          />
        ) : null}

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
    prev.graphicsProfile.shouldAnimateBackground ===
      next.graphicsProfile.shouldAnimateBackground &&
    prev.graphicsProfile.maxBackgroundEffects ===
      next.graphicsProfile.maxBackgroundEffects,
);
