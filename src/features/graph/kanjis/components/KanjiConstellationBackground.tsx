"use client";

import type { GraphicsProfile } from "@/shared/hooks/useGraphicsProfile";
import type { KanjiConstellationQualityProfile } from "../types";

interface KanjiConstellationBackgroundProps {
  qualityProfile: KanjiConstellationQualityProfile;
  graphicsProfile: GraphicsProfile;
}

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function getTwinkleClasses(
  tier: KanjiConstellationQualityProfile["tier"],
  enabled: boolean,
) {
  if (!enabled) {
    return {
      far: null,
      glimmer: null,
      near: null,
      dust: null,
    };
  }

  if (tier === "high") {
    return {
      far: "kanji-space-twinkle-luxe-far",
      glimmer: "kanji-space-twinkle-luxe-glimmer",
      near: "kanji-space-twinkle-luxe-near",
      dust: "kanji-space-twinkle-luxe-dust",
    };
  }

  return {
    far: "kanji-space-twinkle-soft-far",
    glimmer: "kanji-space-twinkle-soft-glimmer",
    near: "kanji-space-twinkle-soft-near",
    dust: null,
  };
}

export function KanjiConstellationBackground({
  qualityProfile,
  graphicsProfile,
}: KanjiConstellationBackgroundProps) {
  const twinkleEnabled =
    graphicsProfile.shouldAnimateBackground && qualityProfile.background.animateTwinkle;
  const breatheEnabled =
    graphicsProfile.shouldAnimateBackground && qualityProfile.background.animateBreathe;
  const showGlimmer =
    qualityProfile.background.showGlimmer && graphicsProfile.maxBackgroundEffects >= 3;
  const showDust = qualityProfile.background.showDust && graphicsProfile.maxBackgroundEffects >= 4;
  const showRing = qualityProfile.background.showRing && graphicsProfile.maxBackgroundEffects >= 3;
  const showFarAtmosphere =
    qualityProfile.background.showFarAtmosphere && graphicsProfile.atmosphereLayerCount >= 3;
  const showMidAtmosphere =
    qualityProfile.background.showMidAtmosphere && graphicsProfile.atmosphereLayerCount >= 2;
  const showNearAtmosphere =
    qualityProfile.background.showNearAtmosphere && graphicsProfile.atmosphereLayerCount >= 1;
  const twinkleClasses = getTwinkleClasses(qualityProfile.tier, twinkleEnabled);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none kanji-space-scene" aria-hidden="true">
      <div className="absolute inset-0 kanji-space-base" />
      <div className="absolute inset-0 kanji-space-ambient" />
      <div className="absolute inset-0 kanji-space-vignette" />
      <div className="absolute kanji-space-layer kanji-space-layer-far kanji-space-layer-stars">
        <div
          className={cn("absolute inset-0 kanji-space-stars-far", twinkleClasses.far)}
        />
      </div>

      {showGlimmer ? (
        <div className="absolute kanji-space-layer kanji-space-layer-mid kanji-space-layer-stars">
          <div
            className={cn("absolute inset-0 kanji-space-stars-glimmer", twinkleClasses.glimmer)}
          />
        </div>
      ) : null}

      {showFarAtmosphere ? (
        <div className="absolute kanji-space-layer kanji-space-layer-far kanji-space-layer-atmosphere">
          <div
            className={cn(
              "kanji-space-atmosphere-surface absolute inset-0 kanji-space-haze-far",
              breatheEnabled
                ? "kanji-space-breathe-slow"
                : null,
            )}
          />
        </div>
      ) : null}

      {showMidAtmosphere ? (
        <div className="absolute kanji-space-layer kanji-space-layer-mid kanji-space-layer-atmosphere">
          <div
            className={cn(
              "kanji-space-atmosphere-surface absolute inset-0 kanji-space-haze-mid",
              breatheEnabled
                ? "kanji-space-breathe-mid"
                : null,
            )}
          />
        </div>
      ) : null}

      {showRing ? (
        <div className="absolute kanji-space-layer kanji-space-layer-mid kanji-space-layer-atmosphere">
          <div className="kanji-space-atmosphere-surface absolute inset-0 kanji-space-ring" />
        </div>
      ) : null}

      <div className="absolute kanji-space-layer kanji-space-layer-near kanji-space-layer-stars">
        <div
          className={cn("absolute inset-0 kanji-space-stars-near", twinkleClasses.near)}
        />
      </div>

      {showDust ? (
        <div className="absolute kanji-space-layer kanji-space-layer-near kanji-space-layer-stars">
          <div
            className={cn("absolute inset-0 kanji-space-stars-dust", twinkleClasses.dust)}
          />
        </div>
      ) : null}

      {showNearAtmosphere ? (
        <div className="absolute kanji-space-layer kanji-space-layer-near kanji-space-layer-atmosphere">
          <div
            className={cn(
              "kanji-space-atmosphere-surface absolute inset-0 kanji-space-haze-near",
              breatheEnabled
                ? "kanji-space-breathe-fast"
                : null,
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
