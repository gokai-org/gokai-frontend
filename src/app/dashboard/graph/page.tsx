"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/features/graph/lib/graphTypes";
import JapanRegionMap from "@/features/graph/vocabulary/components/JapanRegionMap";
import RegionThemeGraph from "@/features/graph/vocabulary/components/RegionThemeGraph";
import RegionVectorGraph from "@/features/graph/vocabulary/components/RegionVectorGraph";
import VocabularyNodePanel from "@/features/graph/vocabulary/components/VocabularyNodePanel";
import { useVocabularyGraph } from "@/features/graph/vocabulary/hooks/useVocabularyGraph";
import {
  buildVocabularySubthemeGraphElements,
  buildVocabularyThemeGraphElements,
} from "@/features/graph/vocabulary/lib/vocabularyGraphBuilder";
import {
  buildVocabularyRegionViewModels,
} from "@/features/graph/vocabulary/lib/vocabularyRegions";
import {
  getVocabularyQuiz,
  listVocabularyWordsBySubthemeId,
} from "@/features/graph/vocabulary/services/api";
import { useSidebar } from "@/shared/components/SidebarContext";
import type {
  VocabularyRegionId,
  VocabularyRegionLayout,
  VocabularyRegionThemeNode,
  VocabularyViewLevel,
  VocabularyWordContent,
  VocabularyWordLesson,
} from "@/features/graph/vocabulary/types";

type SceneTransform = {
  scale: number;
  x: number;
  y: number;
};

type PointerPosition = {
  x: number;
  y: number;
};

type SvgSceneFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const MIN_SCENE_SCALE = 1;
const MAX_SCENE_SCALE = 7.2;
const WHEEL_ZOOM_IN_FACTOR = 1.1;
const WHEEL_ZOOM_OUT_FACTOR = 0.91;
const MAP_PAN_PADDING_X = 96;
const MAP_PAN_PADDING_Y = 56;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getDistance(a: PointerPosition, b: PointerPosition) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function getMidpoint(a: PointerPosition, b: PointerPosition): PointerPosition {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  };
}

function isNodeTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-vocabulary-node='true']"))
  );
}

function isOverlayTarget(target: EventTarget | null) {
  return (
    target instanceof Element &&
    Boolean(target.closest("[data-vocabulary-overlay='true']"))
  );
}

function getRegionTarget(target: EventTarget | null): VocabularyRegionId | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const regionElement = target.closest<HTMLElement>("[data-vocabulary-region]");
  return (
    (regionElement?.dataset.vocabularyRegion as
      | VocabularyRegionId
      | undefined) ?? null
  );
}

function getRenderedSvgFrame(
  sceneSize: { width: number; height: number },
  viewport: VocabularyRegionLayout["viewport"],
): SvgSceneFrame {
  if (
    !sceneSize.width ||
    !sceneSize.height ||
    !viewport.width ||
    !viewport.height
  ) {
    return { x: 0, y: 0, width: sceneSize.width, height: sceneSize.height };
  }

  const svgAspect = viewport.width / viewport.height;
  const sceneAspect = sceneSize.width / sceneSize.height;

  // preserveAspectRatio="xMidYMid meet": scale to FIT (no clipping, full map visible)
  if (sceneAspect > svgAspect) {
    // viewport wider than SVG → fits by HEIGHT, letterbox left/right
    const height = sceneSize.height;
    const width = height * svgAspect;

    return {
      x: (sceneSize.width - width) / 2,
      y: 0,
      width,
      height,
    };
  }

  // viewport taller than SVG → fits by WIDTH, letterbox top/bottom
  const width = sceneSize.width;
  const height = width / svgAspect;

  return {
    x: 0,
    y: (sceneSize.height - height) / 2,
    width,
    height,
  };
}

function clampAxisToFrame({
  position,
  scale,
  frameStart,
  frameSize,
  viewportSize,
  padding,
}: {
  position: number;
  scale: number;
  frameStart: number;
  frameSize: number;
  viewportSize: number;
  padding: number;
}) {
  if (!viewportSize || !frameSize) {
    return position;
  }

  const transformedSize = frameSize * scale;
  const safePadding = Math.max(0, padding);

  if (transformedSize <= viewportSize) {
    const centeredPosition =
      (viewportSize - transformedSize) / 2 - frameStart * scale;

    return clamp(
      position,
      centeredPosition - safePadding,
      centeredPosition + safePadding,
    );
  }

  const minPosition =
    viewportSize - (frameStart + frameSize) * scale - safePadding;
  const maxPosition = -frameStart * scale + safePadding;

  return clamp(position, minPosition, maxPosition);
}

function clampSceneToFrame(
  transform: SceneTransform,
  frame: SvgSceneFrame,
  sceneSize: { width: number; height: number },
): SceneTransform {
  const horizontalPadding = Math.min(
    MAP_PAN_PADDING_X,
    sceneSize.width * 0.16,
  );
  const verticalPadding = Math.min(MAP_PAN_PADDING_Y, sceneSize.height * 0.1);

  return {
    ...transform,
    x: clampAxisToFrame({
      position: transform.x,
      scale: transform.scale,
      frameStart: frame.x,
      frameSize: frame.width,
      viewportSize: sceneSize.width,
      padding: horizontalPadding,
    }),
    y: clampAxisToFrame({
      position: transform.y,
      scale: transform.scale,
      frameStart: frame.y,
      frameSize: frame.height,
      viewportSize: sceneSize.height,
      padding: verticalPadding,
    }),
  };
}

function toWordLesson(
  word: VocabularyWordContent,
  audioByWordId: Map<string, string | undefined>,
): VocabularyWordLesson {
  return {
    wordId: word.id,
    kanji: word.kanji ?? undefined,
    hiragana: word.hiragana ?? undefined,
    meanings: word.meanings?.filter(Boolean) ?? [],
    audio: audioByWordId.get(word.id),
    icon: word.icon ?? null,
  };
}

export default function Page() {
  const { setHidden } = useSidebar();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const dragRef = useRef<{
    start: PointerPosition;
    last: PointerPosition;
    dragged: boolean;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; center: PointerPosition } | null>(
    null,
  );
  const suppressRegionClickRef = useRef(false);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });

  // Motion values: direct DOM updates during pan/zoom — no React re-renders
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvScale = useMotionValue(1);
  const mvLayerWidth = useTransform(mvScale, (scale) => sceneSize.width * scale);
  const mvLayerHeight = useTransform(mvScale, (scale) => sceneSize.height * scale);

  // Stable refs for values consumed in event handlers (no stale closures)
  const manualTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const autoTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const mapFrameRef = useRef<SvgSceneFrame>({ x: 0, y: 0, width: 0, height: 0 });
  const sceneSizeRef = useRef({ width: 0, height: 0 });
  const currentLevelRef = useRef<VocabularyViewLevel>("map");
  const isNavigatingRef = useRef(false);
  const animStopRef = useRef<Array<() => void>>([]);

  const [regionLayouts, setRegionLayouts] = useState<
    Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>
  >({});
  const [currentLevel, setCurrentLevel] = useState<VocabularyViewLevel>("map");
  const [selectedRegionId, setSelectedRegionId] =
    useState<VocabularyRegionId | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);
  const [selectedSubthemeNodeId, setSelectedSubthemeNodeId] = useState<
    string | null
  >(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [subthemeWords, setSubthemeWords] = useState<VocabularyWordLesson[]>([]);
  const [subthemeWordsLoading, setSubthemeWordsLoading] = useState(false);
  const {
    graphs,
    selectedGraph,
    progress,
    themeCatalog,
    subthemeRecommendations,
    loading,
    actionPendingId,
    setSelectedGraphId,
    createGraphFromTheme,
    addSubthemeToGraph,
    reloadProgress,
  } = useVocabularyGraph();

  const regions = useMemo(
    () => buildVocabularyRegionViewModels(themeCatalog, graphs),
    [graphs, themeCatalog],
  );
  const progressItems = useMemo(() => progress?.items ?? [], [progress?.items]);
  const selectedTheme = useMemo(
    () =>
      regions
        .flatMap((region) => region.themes)
        .find((theme) => theme.themeId === selectedThemeId) ?? null,
    [regions, selectedThemeId],
  );
  const selectedSubthemeItem = useMemo(
    () => progressItems.find((item) => item.nodeId === selectedSubthemeNodeId) ?? null,
    [progressItems, selectedSubthemeNodeId],
  );
  const selectedWord = useMemo(
    () => subthemeWords.find((word) => word.wordId === selectedWordId) ?? null,
    [selectedWordId, subthemeWords],
  );
  const isLessonOpen = Boolean(selectedSubthemeItem && selectedWord);
  const activeRegionId = currentLevel === "map" ? null : selectedRegionId;
  const selectedRegion = useMemo(
    () => regions.find((region) => region.id === activeRegionId) ?? null,
    [activeRegionId, regions],
  );
  const mapViewport = useMemo(
    () =>
      (selectedRegion
        ? regionLayouts[selectedRegion.id]?.viewport
        : undefined) ?? Object.values(regionLayouts).find(Boolean)?.viewport,
    [regionLayouts, selectedRegion],
  );
  const mapFrame = useMemo(
    () =>
      mapViewport
        ? getRenderedSvgFrame(sceneSize, mapViewport)
        : { x: 0, y: 0, width: sceneSize.width, height: sceneSize.height },
    [mapViewport, sceneSize],
  );
  const loadingRegionId = useMemo(() => {
    if (!activeRegionId) {
      return null;
    }

    return actionPendingId || subthemeWordsLoading ? activeRegionId : null;
  }, [actionPendingId, activeRegionId, subthemeWordsLoading]);

  useEffect(() => {
    const element = sceneRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      setSceneSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedRegionId) {
      return;
    }

    const fallbackRegionId =
      selectedTheme?.regionId ??
      regions.find(
        (region) =>
          region.themes.some(
            (theme) => theme.themeId === selectedGraph?.themeId,
          ),
      )?.id ??
      null;

    if (fallbackRegionId) {
      setSelectedRegionId(fallbackRegionId);
    }
  }, [regions, selectedGraph?.themeId, selectedRegionId, selectedTheme?.regionId]);

  useEffect(() => {
    if (currentLevel !== "subtheme" || !selectedSubthemeItem?.subthemeId) {
      setSubthemeWords([]);
      return;
    }

    let alive = true;

    queueMicrotask(() => {
      if (!alive) return;
      setSubthemeWordsLoading(true);
    });

    Promise.all([
      listVocabularyWordsBySubthemeId(selectedSubthemeItem.subthemeId),
      getVocabularyQuiz(selectedSubthemeItem.nodeId, "listening"),
    ])
      .then(([words, listeningQuiz]) => {
        if (!alive) return;
        const audioByWordId = new Map(
          listeningQuiz.questions.map((quizQuestion) => [
            quizQuestion.wordId,
            quizQuestion.audio,
          ]),
        );
        setSubthemeWords(words.map((word) => toWordLesson(word, audioByWordId)));
      })
      .catch((quizError) => {
        console.error("Error cargando palabras del subtema:", quizError);
        if (!alive) return;
        setSubthemeWords([]);
      })
      .finally(() => {
        if (!alive) return;
        setSubthemeWordsLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [currentLevel, selectedSubthemeItem]);

  useEffect(() => {
    // Reset manual transform and cancel any running animation when navigating levels
    animStopRef.current.forEach((stop) => stop());
    animStopRef.current = [];
    manualTransformRef.current = { scale: 1, x: 0, y: 0 };
    pointersRef.current.clear();
    dragRef.current = null;
    pinchRef.current = null;
  }, [activeRegionId, currentLevel]);

  useEffect(() => {
    setHidden(isLessonOpen);

    return () => {
      setHidden(false);
    };
  }, [isLessonOpen, setHidden]);

  const graphElements = useMemo(() => {
    if (currentLevel === "subtheme" && selectedSubthemeItem) {
      return buildVocabularySubthemeGraphElements(selectedSubthemeItem, subthemeWords);
    }

    if (currentLevel === "theme" && selectedGraph) {
      return buildVocabularyThemeGraphElements(
        selectedGraph,
        progressItems,
        subthemeRecommendations,
      );
    }

    return null;
  }, [
    currentLevel,
    progressItems,
    selectedGraph,
    selectedSubthemeItem,
    subthemeRecommendations,
    subthemeWords,
  ]);

  const handleRegionSelect = useCallback(
    (regionId: VocabularyRegionId) => {
      setSelectedRegionId(regionId);
      setSelectedThemeId(null);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setSelectedGraphId(null);
      setCurrentLevel("region");
    },
    [setSelectedGraphId],
  );

  const handleThemeSelected = useCallback(
    async (theme: VocabularyRegionThemeNode) => {
      if (!theme.isAvailable || !theme.themeId) {
        return;
      }

      setSelectedRegionId(theme.regionId);
      setSelectedThemeId(theme.themeId);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);

      if (theme.graphId) {
        setSelectedGraphId(theme.graphId);
        setCurrentLevel("theme");
        return;
      }

      const graphId = await createGraphFromTheme(theme.themeId);

      if (graphId) {
        setSelectedGraphId(graphId);
        setCurrentLevel("theme");
      }
    },
    [createGraphFromTheme, setSelectedGraphId],
  );

  const handleNodeSelected = useCallback(
    async (node: GraphNode) => {
      if (node.data.entityKind === "subtheme") {
        if (node.data.isRecommendation && node.data.entityId) {
          const nodeId = await addSubthemeToGraph(node.data.entityId);
          if (nodeId) {
            setSelectedSubthemeNodeId(nodeId);
            setSelectedWordId(null);
            setCurrentLevel("subtheme");
          }
          return;
        }

        setSelectedSubthemeNodeId(node.id);
        setSelectedWordId(null);
        setCurrentLevel("subtheme");
        return;
      }

      if (node.data.entityKind === "word") {
        setSelectedWordId(node.data.entityId ?? node.id.replace(/^word-/, ""));
      }
    },
    [addSubthemeToGraph],
  );

  const handleBack = useCallback(() => {
    if (currentLevel === "subtheme") {
      setSelectedWordId(null);
      setCurrentLevel("theme");
      return;
    }

    if (currentLevel === "theme") {
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setCurrentLevel("region");
      return;
    }

    if (currentLevel === "region") {
      setSelectedThemeId(null);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setSelectedGraphId(null);
      setCurrentLevel("map");
    }
  }, [currentLevel, setSelectedGraphId]);

  const regionGraph =
    graphElements && (currentLevel === "theme" || currentLevel === "subtheme")
      ? {
          nodes: graphElements.nodes,
          edges: graphElements.edges,
          onNodeSelected: handleNodeSelected,
        }
      : undefined;

  const autoTransform = useMemo(() => {
    if (!selectedRegion || currentLevel === "map") {
      return { scale: 1, x: 0, y: 0 };
    }

    const layout = regionLayouts[selectedRegion.id];
    const bounds = layout?.bounds;

    if (!bounds || !layout?.viewport || !sceneSize.width || !sceneSize.height) {
      return { scale: 1.45, x: 0, y: 0 };
    }

    const svgFrame = getRenderedSvgFrame(sceneSize, layout.viewport);
    const regionWidth = Math.max((bounds.width / 100) * svgFrame.width, 1);
    const regionHeight = Math.max((bounds.height / 100) * svgFrame.height, 1);
    const viewportFill = currentLevel === "region" ? 0.78 : 0.72;
    const scale = clamp(
      Math.min(
        6.4,
        Math.max(
          2,
          Math.min(
            (sceneSize.width * viewportFill) / regionWidth,
            (sceneSize.height * viewportFill) / regionHeight,
          ),
        ),
      ),
      1.8,
      6.4,
    );
    const centerX = svgFrame.x + (bounds.centerX / 100) * svgFrame.width;
    const centerY = svgFrame.y + (bounds.centerY / 100) * svgFrame.height;
    const targetX = sceneSize.width / 2;
    const targetY = sceneSize.height / 2;

    return {
      scale,
      x: targetX - centerX * scale,
      y: targetY - centerY * scale,
    };
  }, [
    currentLevel,
    regionLayouts,
    sceneSize,
    selectedRegion,
  ]);

  // Keep refs in sync with derived React values (accessed in event handlers)
  useEffect(() => { autoTransformRef.current = autoTransform; }, [autoTransform]);
  useEffect(() => { mapFrameRef.current = mapFrame; }, [mapFrame]);
  useEffect(() => { sceneSizeRef.current = sceneSize; }, [sceneSize]);
  useEffect(() => { currentLevelRef.current = currentLevel; }, [currentLevel]);

  // When autoTransform changes (level/region change), smoothly transition to new position
  useEffect(() => {
    const manual = manualTransformRef.current;
    // Re-clamp manual in the new auto context
    autoTransformRef.current = autoTransform;
    const clampedScale = clampManualScale(manual.scale);
    const clamped = clampManualPan({ ...manual, scale: clampedScale });
    manualTransformRef.current = clamped;
    const targetX = autoTransform.x + clamped.x;
    const targetY = autoTransform.y + clamped.y;
    const targetScale = autoTransform.scale * clamped.scale;
    animateTransformTo(targetX, targetY, targetScale, isNavigatingRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTransform]); // intentionally only autoTransform — helpers are stable

  // Stable clamp helpers — use refs, no closure deps that change on every render
  const clampManualScale = useCallback((scale: number) => {
    const auto = autoTransformRef.current;
    const min = MIN_SCENE_SCALE / Math.max(auto.scale, 0.001);
    const max = MAX_SCENE_SCALE / Math.max(auto.scale, 0.001);
    return clamp(scale, min, max);
  }, []);

  const clampManualPan = useCallback((transform: SceneTransform): SceneTransform => {
    const auto = autoTransformRef.current;
    const frame = mapFrameRef.current;
    const size = sceneSizeRef.current;
    const finalScale = auto.scale * transform.scale;
    const clamped = clampSceneToFrame(
      { scale: finalScale, x: auto.x + transform.x, y: auto.y + transform.y },
      frame,
      size,
    );
    return { ...transform, x: clamped.x - auto.x, y: clamped.y - auto.y };
  }, []);

  // Helper: stop any ongoing transform animation
  const cancelTransformAnim = useCallback(() => {
    animStopRef.current.forEach((stop) => stop());
    animStopRef.current = [];
  }, []);

  // Helper: animate motion values to a target (smooth level transitions)
  const animateTransformTo = useCallback(
    (x: number, y: number, s: number, instant = false) => {
      cancelTransformAnim();
      if (instant) {
        mvX.set(x);
        mvY.set(y);
        mvScale.set(s);
        return;
      }
      const opts = { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
      const cX = animate(mvX, x, opts);
      const cY = animate(mvY, y, opts);
      const cS = animate(mvScale, s, opts);
      animStopRef.current = [() => cX.stop(), () => cY.stop(), () => cS.stop()];
    },
    [cancelTransformAnim, mvX, mvY, mvScale],
  );

  // Helper: apply a clamped manual transform directly to motion values
  const applyManualTransform = useCallback(
    (newManual: SceneTransform) => {
      const clamped = clampManualPan(newManual);
      manualTransformRef.current = clamped;
      const auto = autoTransformRef.current;
      mvX.set(auto.x + clamped.x);
      mvY.set(auto.y + clamped.y);
      mvScale.set(auto.scale * clamped.scale);
    },
    [clampManualPan, mvX, mvY, mvScale],
  );

  const zoomAt = useCallback(
    (center: PointerPosition, factor: number) => {
      const auto = autoTransformRef.current;
      const current = manualTransformRef.current;
      const nextScale = clampManualScale(current.scale * factor);
      const currentFullScale = auto.scale * current.scale;
      const nextFullScale = auto.scale * nextScale;
      const fullX = auto.x + current.x;
      const fullY = auto.y + current.y;
      const nextFullX = center.x - ((center.x - fullX) / currentFullScale) * nextFullScale;
      const nextFullY = center.y - ((center.y - fullY) / currentFullScale) * nextFullScale;
      applyManualTransform({ scale: nextScale, x: nextFullX - auto.x, y: nextFullY - auto.y });
    },
    [applyManualTransform, clampManualScale],
  );

  // Native wheel handler — registered with { passive: false } so preventDefault works
  const handleWheelNative = useCallback(
    (event: WheelEvent) => {
      if (isOverlayTarget(event.target)) {
        return;
      }

      event.preventDefault();

      const rect = sceneRef.current?.getBoundingClientRect();
      if (!rect) return;

      const totalScale = autoTransformRef.current.scale * manualTransformRef.current.scale;
      if (event.deltaY > 0 && currentLevelRef.current !== "map" && totalScale <= MIN_SCENE_SCALE + 0.04) {
        handleBack();
        return;
      }

      zoomAt(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR,
      );
    },
    [handleBack, zoomAt],
  );

  // Add passive:false wheel listener once
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [handleWheelNative]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isNodeTarget(event.target) || isOverlayTarget(event.target)) {
        return;
      }

      // Cancel any running level-transition animation and sync manual ref from live values
      cancelTransformAnim();
      const auto = autoTransformRef.current;
      manualTransformRef.current = {
        scale: mvScale.get() / Math.max(auto.scale, 0.001),
        x: mvX.get() - auto.x,
        y: mvY.get() - auto.y,
      };

      isNavigatingRef.current = true;
      if (sceneRef.current) sceneRef.current.style.cursor = "grabbing";

      const position = { x: event.clientX, y: event.clientY };
      pointersRef.current.set(event.pointerId, position);

      if (pointersRef.current.size === 1) {
        dragRef.current = { start: position, last: position, dragged: false };
        pinchRef.current = null;
        return;
      }

      const pointers = Array.from(pointersRef.current.values());
      if (pointers.length >= 2) {
        dragRef.current = null;
        pinchRef.current = {
          distance: getDistance(pointers[0], pointers[1]),
          center: getMidpoint(pointers[0], pointers[1]),
        };
      }
    },
    [cancelTransformAnim, mvScale, mvX, mvY],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isOverlayTarget(event.target)) {
        return;
      }

      if (!pointersRef.current.has(event.pointerId)) {
        return;
      }

      const position = { x: event.clientX, y: event.clientY };
      pointersRef.current.set(event.pointerId, position);

      const pointers = Array.from(pointersRef.current.values());

      if (pointers.length >= 2) {
        const distance = getDistance(pointers[0], pointers[1]);
        const center = getMidpoint(pointers[0], pointers[1]);
        const previous = pinchRef.current;

        if (previous && previous.distance > 0) {
          const rect = sceneRef.current?.getBoundingClientRect();
          zoomAt(
            rect ? { x: center.x - rect.left, y: center.y - rect.top } : center,
            clamp(distance / previous.distance, 0.82, 1.22),
          );
          const current = manualTransformRef.current;
          applyManualTransform({
            ...current,
            x: current.x + center.x - previous.center.x,
            y: current.y + center.y - previous.center.y,
          });
        }

        pinchRef.current = { distance, center };
        suppressRegionClickRef.current = true;
        return;
      }

      const drag = dragRef.current;

      if (!drag) {
        return;
      }

      const distance = getDistance(position, drag.start);
      const deltaX = position.x - drag.last.x;
      const deltaY = position.y - drag.last.y;

      if (distance > 4) {
        drag.dragged = true;
        suppressRegionClickRef.current = true;

        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }

      drag.last = position;

      if (drag.dragged) {
        const current = manualTransformRef.current;
        applyManualTransform({ ...current, x: current.x + deltaX, y: current.y + deltaY });
      }
    },
    [applyManualTransform, zoomAt],
  );

  const handlePointerEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (isOverlayTarget(event.target)) {
        pointersRef.current.delete(event.pointerId);

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }

        if (pointersRef.current.size === 0) {
          dragRef.current = null;
          pinchRef.current = null;
          isNavigatingRef.current = false;
          if (sceneRef.current) sceneRef.current.style.cursor = "grab";
        }

        return;
      }

      const currentDrag = dragRef.current;
      const selectedRegionFromTarget =
        !currentDrag?.dragged && pointersRef.current.size === 1
          ? getRegionTarget(event.target)
          : null;

      pointersRef.current.delete(event.pointerId);

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (pointersRef.current.size === 0) {
        dragRef.current = null;
        pinchRef.current = null;
        isNavigatingRef.current = false;
        if (sceneRef.current) sceneRef.current.style.cursor = "grab";

        if (selectedRegionFromTarget && !suppressRegionClickRef.current) {
          handleRegionSelect(selectedRegionFromTarget);
          suppressRegionClickRef.current = true;
        }

        window.setTimeout(() => {
          suppressRegionClickRef.current = false;
        }, 180);
        return;
      }

      const pointers = Array.from(pointersRef.current.values());
      if (pointers.length === 1) {
        dragRef.current = {
          start: pointers[0],
          last: pointers[0],
          dragged: false,
        };
        pinchRef.current = null;
      }
    },
    [handleRegionSelect],
  );

  const handleMapRegionSelect = useCallback(
    (regionId: VocabularyRegionId) => {
      if (suppressRegionClickRef.current) {
        return;
      }

      handleRegionSelect(regionId);
    },
    [handleRegionSelect],
  );

  const layoutCountsByRegion = useMemo(() => {
    if (!activeRegionId) {
      return undefined;
    }

    const nodeCount =
      currentLevel === "region"
        ? (selectedRegion?.themes.length ?? 0)
        : regionGraph?.nodes.length;

    if (!nodeCount) {
      return undefined;
    }

    const sampleCount = Math.min(Math.max(nodeCount * 6, 18), 56);

    return {
      [activeRegionId]: sampleCount,
    };
  }, [
    activeRegionId,
    currentLevel,
    regionGraph?.nodes.length,
    selectedRegion?.themes.length,
  ]);

  return (
    <div
      ref={sceneRef}
      data-help-target="graph-canvas"
      className="absolute inset-0 z-0 h-full w-full cursor-grab overflow-hidden touch-none select-none bg-surface-primary"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      style={{
        overscrollBehavior: "contain",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {loading ? (
        <div
          data-help-loading="true"
          className="absolute inset-0 flex items-center justify-center"
          aria-label="Cargando vocabulario"
        >
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
        </div>
      ) : (
        <>
          <motion.div
            data-map-transform-layer="true"
            className="map-transform-layer absolute left-0 top-0 z-10 bg-transparent"
            style={{
              left: mvX,
              top: mvY,
              width: mvLayerWidth,
              height: mvLayerHeight,
              willChange: "left, top, width, height",
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <JapanRegionMap
              regions={regions}
              selectedRegionId={activeRegionId}
              loadingRegionId={loadingRegionId}
              layoutCountsByRegion={layoutCountsByRegion}
              onRegionSelect={handleMapRegionSelect}
              onRegionHover={() => undefined}
              onLayoutChange={setRegionLayouts}
            />

            {selectedRegion && currentLevel === "region" ? (
              <RegionThemeGraph
                region={selectedRegion}
                regionBounds={regionLayouts[selectedRegion.id]?.bounds ?? null}
                nodePoints={regionLayouts[selectedRegion.id]?.nodePoints ?? null}
                viewport={regionLayouts[selectedRegion.id]?.viewport ?? null}
                actionPendingId={actionPendingId}
                onThemeSelect={handleThemeSelected}
              />
            ) : null}

            <AnimatePresence>
              {selectedRegion &&
              regionGraph &&
              (currentLevel === "theme" || currentLevel === "subtheme") ? (
                <RegionVectorGraph
                  key={`${currentLevel}-${activeRegionId}-${regionGraph.nodes.map((node: GraphNode) => node.id).join("|")}`}
                  nodes={regionGraph.nodes}
                  edges={regionGraph.edges as GraphEdge[]}
                  regionBounds={regionLayouts[selectedRegion.id]?.bounds ?? null}
                  nodePoints={regionLayouts[selectedRegion.id]?.nodePoints ?? null}
                  viewport={regionLayouts[selectedRegion.id]?.viewport ?? null}
                  level={currentLevel}
                  onNodeSelected={regionGraph.onNodeSelected}
                />
              ) : null}
            </AnimatePresence>
          </motion.div>
          <VocabularyNodePanel
            item={selectedSubthemeItem}
            question={selectedWord}
            onClose={() => setSelectedWordId(null)}
            onSaved={reloadProgress}
          />
        </>
      )}
    </div>
  );
}
