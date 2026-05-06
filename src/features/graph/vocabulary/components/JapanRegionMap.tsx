"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import { buildRegionLayout } from "../lib/regionNodePlacement";
import { REGION_ORDER } from "../lib/vocabularyRegions";
import type {
  VocabularyRegionId,
  VocabularyRegionLayout,
  VocabularyRegionViewModel,
} from "../types";
import ActiveRegionOverlay from "./japanMap/ActiveRegionOverlay";
import InteractiveRegionLayer, {
  type RegionVisualStatus,
} from "./japanMap/InteractiveRegionLayer";
import MeasurementLayer, {
  type MeasurementLayerHandle,
} from "./japanMap/MeasurementLayer";
import StaticJapanMapLayer from "./japanMap/StaticJapanMapLayer";
import {
  getCachedJapanMap,
  loadJapanMapAssets,
  type ParsedJapanMap,
} from "./japanMap/japanMapAssets";
import { JAPAN_MAP_PALETTE } from "./japanMap/japanMapTheme";

type JapanRegionMapProps = {
  regions: VocabularyRegionViewModel[];
  selectedRegionId: VocabularyRegionId | null;
  loadingRegionId?: VocabularyRegionId | null;
  layoutCountsByRegion?: Partial<Record<VocabularyRegionId, number>>;
  onRegionSelect: (regionId: VocabularyRegionId) => void;
  onLayoutChange: (
    layout: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>,
  ) => void;
};

type RegionIconBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type IconClassificationCache = {
  iconBoxesByRegion: Partial<Record<VocabularyRegionId, RegionIconBox[]>>;
};

type RegionLayoutCacheEntry = {
  layoutCount: number;
  iconLayoutRevision: number;
  layout: VocabularyRegionLayout;
};

let iconClassificationCache: IconClassificationCache | null = null;

const SVG_GEOMETRY_SELECTOR = "path, polygon, circle, ellipse, rect";

/**
 * Composes the Japan map view as a stack of independent layers:
 *
 *   1. `StaticJapanMapLayer`    — high-fidelity raster of the full map (no React).
 *   2. `InteractiveRegionLayer` — 8 transparent hit-targets, CSS-driven hover.
 *   3. `ActiveRegionOverlay`    — colored highlight + glow for the active region.
 *   4. `MeasurementLayer`       — off-screen geometry used only for layout math.
 *
 * The visible heavy SVG never enters the React tree, so hover and selection
 * cost is independent of the source map's complexity.
 */
function JapanRegionMap({
  regions,
  selectedRegionId,
  loadingRegionId = null,
  layoutCountsByRegion,
  onRegionSelect,
  onLayoutChange,
}: JapanRegionMapProps) {
  const platformMotion = usePlatformMotion();
  const [parsedMap, setParsedMap] = useState<ParsedJapanMap | null>(() =>
    getCachedJapanMap(),
  );
  const [iconLayoutRevision, setIconLayoutRevision] = useState(0);
  const [layoutCacheVersion, setLayoutCacheVersion] = useState(0);

  const measurementRef = useRef<MeasurementLayerHandle | null>(null);
  const iconBoxesByRegionRef = useRef<
    Partial<Record<VocabularyRegionId, RegionIconBox[]>>
  >({});
  const layoutCacheRef = useRef<
    Partial<Record<VocabularyRegionId, RegionLayoutCacheEntry>>
  >({});
  const pendingLayoutUpgradeRef = useRef<
    Partial<Record<VocabularyRegionId, number | undefined>>
  >({});

  const heavyEffectsEnabled =
    platformMotion.heavyAnimationsEnabled &&
    platformMotion.graphicsProfile.shouldUseHeavyEffects;

  const regionLookup = useMemo(
    () => Object.fromEntries(regions.map((region) => [region.id, region])),
    [regions],
  );

  const regionStatusByRegion = useMemo(() => {
    const result: Partial<Record<VocabularyRegionId, RegionVisualStatus>> = {};

    regions.forEach((region) => {
      const hasAvailable = region.themes.some((theme) => theme.isAvailable);
      const allCompleted =
        region.themes.length > 0 &&
        region.themes.every((theme) => theme.status === "completed");

      result[region.id] = !hasAvailable
        ? "locked"
        : allCompleted
          ? "completed"
          : "available";
    });

    return result;
  }, [regions]);

  // Load (or reuse cached) parsed map exactly once per mount.
  useEffect(() => {
    if (parsedMap) {
      return;
    }

    let active = true;

    loadJapanMapAssets()
      .then((nextParsedMap) => {
        if (active) {
          setParsedMap(nextParsedMap);
        }
      })
      .catch((error) => {
        console.error("Error cargando mapa de Japon:", error);
      });

    return () => {
      active = false;
    };
  }, [parsedMap]);

  // Stable handler — keeps InteractiveRegionLayer's memo intact regardless of
  // how the parent re-creates its callback identity.
  const handleRegionSelect = useCallback(
    (regionId: VocabularyRegionId) => {
      onRegionSelect(regionId);
    },
    [onRegionSelect],
  );

  // Classify icons → region (one-shot, cached globally) so node placement
  // can avoid overlapping interior decorations. Deferred until a region is
  // selected so the initial map load and the first drag are uncontested.
  useEffect(() => {
    if (!parsedMap || !selectedRegionId) {
      return;
    }

    const measurement = measurementRef.current;

    if (!measurement) {
      return;
    }

    const svgElement = measurement.getSvg();

    if (!svgElement) {
      return;
    }

    if (iconClassificationCache) {
      iconBoxesByRegionRef.current = iconClassificationCache.iconBoxesByRegion;
      setIconLayoutRevision((value) => value + 1);
      return;
    }

    let cancelled = false;

    const classifyIcons = () => {
      if (cancelled) {
        return;
      }

      const iconShapes = measurement.getIconShapes();
      const point = svgElement.createSVGPoint();
      const iconBoxesByRegion: Partial<Record<VocabularyRegionId, RegionIconBox[]>> =
        {};

      const regionGeometry = REGION_ORDER.map((regionId) => {
        const group = measurement.getRegionGroup(regionId);
        const shapes = group
          ? Array.from(
              group.querySelectorAll<SVGGeometryElement>(SVG_GEOMETRY_SELECTOR),
            )
          : [];
        const boxes = shapes.map((shape) => {
          try {
            return shape.getBBox();
          } catch {
            return null;
          }
        });

        return { regionId, shapes, boxes };
      });

      iconShapes.forEach((icon) => {
        let box: SVGRect | DOMRect;

        try {
          box = icon.getBBox();
        } catch {
          return;
        }

        if (!box.width && !box.height) {
          return;
        }

        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        point.x = centerX;
        point.y = centerY;

        outer: for (const { regionId, shapes, boxes } of regionGeometry) {
          for (let shapeIndex = 0; shapeIndex < shapes.length; shapeIndex += 1) {
            const regionBox = boxes[shapeIndex];

            if (!regionBox) {
              continue;
            }

            if (
              centerX < regionBox.x ||
              centerX > regionBox.x + regionBox.width ||
              centerY < regionBox.y ||
              centerY > regionBox.y + regionBox.height
            ) {
              continue;
            }

            if (shapes[shapeIndex].isPointInFill(point)) {
              iconBoxesByRegion[regionId] = [
                ...(iconBoxesByRegion[regionId] ?? []),
                { x: box.x, y: box.y, width: box.width, height: box.height },
              ];
              break outer;
            }
          }
        }
      });

      if (cancelled) {
        return;
      }

      iconClassificationCache = { iconBoxesByRegion };
      iconBoxesByRegionRef.current = iconBoxesByRegion;
      setIconLayoutRevision((value) => value + 1);
    };

    // Delay 300 ms so the selection animation completes before the
    // classification work (getBBox / isPointInFill) competes for CPU.
    const timeoutId = window.setTimeout(classifyIcons, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [parsedMap, selectedRegionId]);

  // Cancel any pending layout upgrades when the component unmounts.
  useEffect(() => {
    const pending = pendingLayoutUpgradeRef.current;
    return () => {
      Object.values(pending).forEach((handle) => {
        if (typeof handle === "number") {
          window.cancelAnimationFrame(handle);
        }
      });
      pendingLayoutUpgradeRef.current = {};
    };
  }, []);

  // Build node-placement layout for the active region only.
  // Deferring until a region is selected means the initial map view
  // and the first-drag path are free of getBBox / SVG geometry work.
  useEffect(() => {
    if (!parsedMap || !selectedRegionId) {
      return;
    }

    const measurement = measurementRef.current;
    const svgElement = measurement?.getSvg() ?? null;

    if (!measurement || !svgElement) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const regionId = selectedRegionId;
      const group = measurement.getRegionGroup(regionId);
      const region = regionLookup[regionId];

      if (!group || !region) {
        return;
      }

      const layoutCount = Math.max(
        region.themes.length,
        layoutCountsByRegion?.[regionId] ?? 0,
      );
      const cachedLayout = layoutCacheRef.current[regionId];

      if (
        cachedLayout &&
        cachedLayout.iconLayoutRevision === iconLayoutRevision &&
        cachedLayout.layoutCount >= layoutCount
      ) {
        onLayoutChange({ [regionId]: cachedLayout.layout });
        return;
      }

      const layout = buildRegionLayout(
        group,
        svgElement,
        layoutCount,
        iconBoxesByRegionRef.current[regionId] ?? [],
      );

      if (!layout) {
        return;
      }

      layoutCacheRef.current[regionId] = {
        layoutCount,
        iconLayoutRevision,
        layout,
      };
      onLayoutChange({ [regionId]: layout });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [
    iconLayoutRevision,
    layoutCountsByRegion,
    onLayoutChange,
    parsedMap,
    regionLookup,
    selectedRegionId,
  ]);

  if (!parsedMap) {
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-label="Cargando mapa de Japon"
        style={{ backgroundColor: JAPAN_MAP_PALETTE.background }}
      >
        <StaticJapanMapLayer />
        <div className="relative h-7 w-7 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    );
  }

  return (
    <div
      className="japan-map-stage absolute inset-0"
      style={{
        contain: "layout paint style",
        isolation: "isolate",
        backgroundColor: JAPAN_MAP_PALETTE.background,
        backgroundImage:
          // Subtle atmospheric depth without the heavy reddish tint.
          "radial-gradient(ellipse at 50% 45%, rgba(14, 10, 10, 0.40) 0%, rgba(11, 11, 13, 0) 65%)",
      }}
    >
      <StaticJapanMapLayer />
      {/* Dark veil that fades in when a region is selected, directing focus to
          the active region overlay rendered above it. CSS transition keeps it
          smooth; pointer-events:none so it never blocks interaction. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: JAPAN_MAP_PALETTE.dimOverlay,
          opacity: selectedRegionId ? 1 : 0,
          transition: "opacity 380ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      />
      {/* Dark veil that fades in when a region is selected, directing focus
          to the active region overlay above it. pointer-events:none so it
          never blocks clicks on the interactive region layer. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundColor: JAPAN_MAP_PALETTE.dimOverlay,
          opacity: selectedRegionId ? 1 : 0,
          transition: "opacity 380ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        }}
      />
      <ActiveRegionOverlay
        parsedMap={parsedMap}
        activeRegionId={selectedRegionId}
        loadingRegionId={loadingRegionId}
        heavyEffectsEnabled={heavyEffectsEnabled}
        activeRegionStatus={
          selectedRegionId ? regionStatusByRegion[selectedRegionId] : undefined
        }
      />
      <InteractiveRegionLayer
        parsedMap={parsedMap}
        regionStatusByRegion={regionStatusByRegion}
        activeRegionId={selectedRegionId}
        onRegionSelect={handleRegionSelect}
      />
      {/* MeasurementLayer hosts the full SVG for getBBox/isPointInFill.
          Mounting it only when a region is active avoids adding thousands of
          DOM nodes during the map overview and the first-drag path. */}
      {selectedRegionId ? (
        <MeasurementLayer ref={measurementRef} parsedMap={parsedMap} />
      ) : null}
    </div>
  );
}

JapanRegionMap.displayName = "JapanRegionMap";

export default memo(JapanRegionMap);
