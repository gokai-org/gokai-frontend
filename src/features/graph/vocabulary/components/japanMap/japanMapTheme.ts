/**
 * Visual theme for the Japan map. Kept isolated from `vocabularyRegions.ts` so
 * the rest of the Vocabulary feature (region badges, buttons, subtitles) can
 * keep using its existing identity colors without being affected by the map's
 * dark premium restyle.
 */

export type RegionVisualStatus = "locked" | "available" | "completed";

export const JAPAN_MAP_PALETTE = {
  background: "#0B0B0D",
  mapBase: "#141416",

  // Resting fills are near-black — the static map's geography shows through
  // without imposing a red tint. Color only enters on interaction or progress.
  regionIdle: "#0C0C0F",
  regionAvailable: "#150A0A",
  regionHover: "#D42828",
  regionActive: "#E03535",
  regionCompleted: "#7A1A1A",

  // Region-boundary strokes sit visually above the internal prefecture lines
  // baked into the static SVG (which are muted by brightness(0.34)).
  strokeIdle: "rgba(255, 255, 255, 0.12)",
  strokeHover: "rgba(255, 165, 165, 0.68)",
  strokeActive: "rgba(241, 244, 248, 0.60)",
  strokeCompleted: "rgba(170, 176, 184, 0.38)",

  iconIdle: "rgba(255, 255, 255, 0.18)",
  iconHover: "rgba(255, 245, 235, 0.90)",

  // Semi-opaque veil applied over the static map when a region is selected,
  // directing focus to the active region overlay rendered above it.
  dimOverlay: "rgba(5, 5, 8, 0.52)",
} as const;

/** Fill color used at rest for each interactive region status. */
export const REGION_FILL_BY_STATUS: Record<RegionVisualStatus, string> = {
  locked: JAPAN_MAP_PALETTE.regionIdle,
  available: JAPAN_MAP_PALETTE.regionAvailable,
  completed: JAPAN_MAP_PALETTE.regionCompleted,
};
