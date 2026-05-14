"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { scheduleMapIdleWork } from "../lib/japanMapPerformance";
import {
  buildRegionBoundsLayout,
  buildRegionLayout,
} from "../lib/regionNodePlacement";
import type {
  VocabularyRegionId,
  VocabularyRegionLayout,
  VocabularyRegionViewModel,
} from "../types";
import GraphHoverCard from "@/features/graph/components/GraphHoverCard";
import { KazuMascot } from "@/features/mascot";
import ActiveRegionOverlay from "./japanMap/ActiveRegionOverlay";
import CartographicLabelLayer, {
  REGION_JP_LABELS,
} from "./japanMap/CartographicLabelLayer";
import InteractiveRegionLayer, {
  type RegionHoverState,
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

type JapanRegionMapProps = {
  regions: VocabularyRegionViewModel[];
  selectedRegionId: VocabularyRegionId | null;
  loadingRegionId?: VocabularyRegionId | null;
  layoutCountsByRegion?: Partial<Record<VocabularyRegionId, number>>;
  hoverResetToken?: number;
  cultureHoverEnabled?: boolean;
  interactionDisabled?: boolean;
  onRegionSelect: (regionId: VocabularyRegionId) => void;
  onLayoutChange: (
    layout: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>,
  ) => void;
};

type RegionLayoutCacheEntry = {
  layoutCount: number;
  layout: VocabularyRegionLayout;
};

const REGION_LAYOUT_POINTS_DELAY = 420;

const REGION_KAZU_DESCRIPTIONS: Record<VocabularyRegionId, string> = {
  hokkaido: "La isla más septentrional de Japón. Famosa por su naturaleza virgen, gastronomía única y los espectaculares festivales de nieve. ¡Un mundo aparte!",
  tohoku: "El norte de Honshu entre montañas y costas salvajes. Rica en onsen termales, artesanía tradicional y festivales centenarios llenos de color.",
  kanto: "Hogar de Tokio, la metrópolis más grande del mundo. La región más dinámica de Japón: economía, cultura pop, anime y modernidad en un solo lugar.",
  chubu: "El corazón geográfico de Japón. Aquí viven el majestuoso Monte Fuji, los Alpes japoneses y ciudades históricas como Nagoya y Kanazawa.",
  kansai: "El alma cultural y gastronómica de Japón. Kioto, Osaka y Nara condensan siglos de historia, templos sagrados, teatro Noh y cocina incomparable.",
  chugoku: "El extremo occidental de Honshu. Tierra de Hiroshima, el Mar Interior de Seto y paisajes de serena y conmovedora belleza.",
  shikoku: "La isla del gran peregrinaje budista: 88 templos que rodean una isla de espíritu ancestral, naturaleza exuberante y hospitalidad legendaria.",
  kyushu: "La isla más meridional de las principales. Volcanes activos, onsen extraordinarios y puerta histórica de Japón hacia el continente asiático.",
};

/**
 * Composes the Japan map view as a stack of independent layers:
 *
 *   1. `StaticJapanMapLayer`    — high-fidelity raster of the full map (no React).
 *   2. `InteractiveRegionLayer` — 8 transparent hit-targets, CSS-driven hover.
 *   3. `ActiveRegionOverlay`    — lightweight highlight for the active region.
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
  hoverResetToken = 0,
  cultureHoverEnabled = false,
  interactionDisabled = false,
  onRegionSelect,
  onLayoutChange,
}: JapanRegionMapProps) {
  const [parsedMap, setParsedMap] = useState<ParsedJapanMap | null>(() =>
    getCachedJapanMap(),
  );
  const [hoveredRegion, setHoveredRegion] = useState<{
    id: VocabularyRegionId;
    x: number;
    y: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const measurementRef = useRef<MeasurementLayerHandle | null>(null);
  const layoutCacheRef = useRef<
    Partial<Record<VocabularyRegionId, RegionLayoutCacheEntry>>
  >({});

  const regionLookup = useMemo(
    () => Object.fromEntries(regions.map((region) => [region.id, region])),
    [regions],
  );
  const hoveredRegionData = hoveredRegion ? regionLookup[hoveredRegion.id] ?? null : null;
  const hoveredRegionJpLabel = hoveredRegion ? REGION_JP_LABELS[hoveredRegion.id] : null;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHoveredRegion(null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [hoverResetToken]);

  useEffect(() => {
    if (!interactionDisabled) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setHoveredRegion(null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [interactionDisabled]);

  useEffect(() => {
    if (cultureHoverEnabled) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setHoveredRegion(null);
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [cultureHoverEnabled]);

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

  const handleRegionHoverChange = useCallback((state: RegionHoverState | null) => {
    if (!state?.regionId) {
      setHoveredRegion(null);
      return;
    }

    if (state.pointerType !== "mouse") {
      setHoveredRegion(null);
      return;
    }

    const container = containerRef.current;
    const transformLayer = container?.closest(".map-transform-layer");
    const rect = container?.getBoundingClientRect();

    if (
      transformLayer?.classList.contains("is-zooming") ||
      transformLayer?.classList.contains("is-dragging")
    ) {
      setHoveredRegion(null);
      return;
    }

    if (!rect) {
      setHoveredRegion(null);
      return;
    }

    setHoveredRegion({
      id: state.regionId,
      x: state.clientX,
      y: state.clientY,
    });
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

    let cancelPointLayout: (() => void) | null = null;
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

      if (cachedLayout) {
        onLayoutChange({ [regionId]: cachedLayout.layout });

        if (cachedLayout.layoutCount >= layoutCount) {
          return;
        }
      }

      if (!cachedLayout) {
        const boundsLayout = buildRegionBoundsLayout(group, svgElement);

        if (boundsLayout) {
          onLayoutChange({ [regionId]: boundsLayout });
        }
      }

      if (layoutCount <= 0) {
        return;
      }

      cancelPointLayout = scheduleMapIdleWork(() => {
        const latestMeasurement = measurementRef.current;
        const latestSvgElement = latestMeasurement?.getSvg() ?? null;
        const latestGroup = latestMeasurement?.getRegionGroup(regionId) ?? null;

        if (!latestMeasurement || !latestSvgElement || !latestGroup) {
          return;
        }

        const layout = buildRegionLayout(
          latestGroup,
          latestSvgElement,
          layoutCount,
        );

        if (!layout) {
          return;
        }

        layoutCacheRef.current[regionId] = {
          layoutCount,
          layout,
        };
        onLayoutChange({ [regionId]: layout });
      }, {
        delay: REGION_LAYOUT_POINTS_DELAY,
        timeout: REGION_LAYOUT_POINTS_DELAY + 700,
      });
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      cancelPointLayout?.();
    };
  }, [
    layoutCountsByRegion,
    onLayoutChange,
    parsedMap,
    regionLookup,
    selectedRegionId,
  ]);

  if (!parsedMap) {
    return (
      <div
        className="japan-map-stage absolute inset-0 flex items-center justify-center"
        aria-label="Cargando mapa de Japon"
      >
        <StaticJapanMapLayer />
        <div className="relative h-7 w-7 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="japan-map-stage absolute inset-0"
      style={{ contain: "layout paint style", isolation: "isolate" }}
    >
      <StaticJapanMapLayer parsedMap={parsedMap} />
      <div
        aria-hidden
        className="vmap-dim-overlay pointer-events-none absolute inset-0"
        style={{
          opacity: selectedRegionId ? 1 : 0,
        }}
      />
      <ActiveRegionOverlay
        parsedMap={parsedMap}
        activeRegionId={selectedRegionId}
        loadingRegionId={loadingRegionId}
        activeRegionStatus={
          selectedRegionId ? regionStatusByRegion[selectedRegionId] : undefined
        }
      />
      <InteractiveRegionLayer
        parsedMap={parsedMap}
        regionStatusByRegion={regionStatusByRegion}
        activeRegionId={selectedRegionId}
        disabled={interactionDisabled}
        onRegionHoverChange={cultureHoverEnabled ? handleRegionHoverChange : undefined}
        onRegionSelect={handleRegionSelect}
      />
      <CartographicLabelLayer
        parsedMap={parsedMap}
        activeRegionId={selectedRegionId}
      />
      {cultureHoverEnabled && hoveredRegionData && hoveredRegionJpLabel && hoveredRegion ? (
        <GraphHoverCard
          variant="kazu"
          x={hoveredRegion.x}
          y={hoveredRegion.y}
          eyebrow="Guía KAZU"
          title={hoveredRegionData.label}
          subtitle={hoveredRegionJpLabel}
          subtitleLang="ja"
          caption={REGION_KAZU_DESCRIPTIONS[hoveredRegion.id]}
          mascot={
            <KazuMascot
              state="focus"
              size={120}
              focusOnHover={false}
              ariaLabel={`Kazu explica la región ${hoveredRegionData.label}`}
            />
          }
        />
      ) : null}
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
