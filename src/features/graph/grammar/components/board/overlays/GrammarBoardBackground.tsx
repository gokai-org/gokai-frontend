"use client";

import { memo } from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export const GrammarBoardBackground = memo(function GrammarBoardBackground() {
  const { graphicsProfile, shouldAnimate, shouldUseLightAnimations } =
    usePlatformMotion();

  const showStars = graphicsProfile.maxBackgroundEffects >= 2;
  const showAtmosphere = graphicsProfile.maxBackgroundEffects >= 3;
  const animateStars = graphicsProfile.shouldAnimateBackground && shouldAnimate;
  const animateBreathe =
    graphicsProfile.shouldAnimateBackground &&
    shouldAnimate &&
    !shouldUseLightAnimations;

  return (
    <div
      className="absolute inset-0 pointer-events-none kanji-bg-scene"
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
});
