"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
import type { GraphEdge, GraphNode } from "@/features/graph/lib/graphTypes";
import JapanRegionMap from "@/features/graph/vocabulary/components/JapanRegionMap";
import RegionThemeGraph from "@/features/graph/vocabulary/components/RegionThemeGraph";
import RegionVectorGraph from "@/features/graph/vocabulary/components/RegionVectorGraph";
import VocabularyNodePanel from "@/features/graph/vocabulary/components/VocabularyNodePanel";
import { useDeferredGraphMount } from "@/features/graph/vocabulary/hooks/useDeferredGraphMount";
import { useVocabularyGraph } from "@/features/graph/vocabulary/hooks/useVocabularyGraph";
import { loadJapanMapAssets } from "@/features/graph/vocabulary/components/japanMap/japanMapAssets";
import { buildRegionGraphLayout } from "@/features/graph/vocabulary/lib/regionGraphLayout";
import {
  buildVocabularySubthemeGraphElements,
  buildVocabularyThemeGraphElements,
} from "@/features/graph/vocabulary/lib/vocabularyGraphBuilder";
import {
  findWordProgress,
  mergeWordProgress,
} from "@/features/graph/vocabulary/lib/vocabularyQuizProgress";
import {
  buildVocabularyRegionViewModels,
} from "@/features/graph/vocabulary/lib/vocabularyRegions";
import {
  LESSON_DRAWER_DESKTOP_WIDTH,
  LESSON_DRAWER_MAX_VIEWPORT_RATIO,
} from "@/features/lessons/lib/drawerLayout";
import {
  getVocabularyQuiz,
  listVocabularyWordsBySubthemeId,
} from "@/features/graph/vocabulary/services/api";
import { useSidebar } from "@/shared/components/SidebarContext";
import { useShakeFeedback } from "@/shared/hooks/useShakeFeedback";
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
const MAX_SCENE_SCALE = 16.0;
const WHEEL_ZOOM_IN_FACTOR = 1.15;
const WHEEL_ZOOM_OUT_FACTOR = 0.87;
const MAP_PAN_PADDING_X = 96;
const MAP_PAN_PADDING_Y = 56;
const REGION_OFFSCREEN_DESELECT_MARGIN = 24;
const CAMERA_AUTO_TRANSITION_DURATION = 0.58;
const VECTOR_GRAPH_MOUNT_DELAY = Math.round(
  CAMERA_AUTO_TRANSITION_DURATION * 1000 + 180,
);
const AUTO_REGION_VIEWPORT_FILL = 0.84;
const AUTO_REGION_MIN_SCALE = 2.9;
const AUTO_REGION_BASE_SCALE = 3.45;
const AUTO_REGION_MAX_SCALE = 11.6;
const AUTO_REGION_EDGE_MAX_SCALE = 13.2;
const AUTO_NODE_FOCUS_SCALE = 1.58;
const AUTO_WORD_FOCUS_SCALE = 2.55;
const AUTO_NODE_MAX_SCALE = 14.4;
const AUTO_WORD_MAX_SCALE = 16;
const LOCKED_THEME_SHAKE_DURATION_MS = 640;
const REGION_EDGE_ZOOM_BONUS = 0.18;
const REGION_FOCUS_OVERSCAN_RATIO = 0.28;

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

function isRegionOutsideViewport({
  bounds,
  frame,
  transform,
  viewportSize,
  margin = REGION_OFFSCREEN_DESELECT_MARGIN,
}: {
  bounds: VocabularyRegionLayout["bounds"];
  frame: SvgSceneFrame;
  transform: SceneTransform;
  viewportSize: { width: number; height: number };
  margin?: number;
}) {
  const left =
    transform.x + (frame.x + (bounds.x / 100) * frame.width) * transform.scale;
  const top =
    transform.y + (frame.y + (bounds.y / 100) * frame.height) * transform.scale;
  const width = (frame.width * bounds.width * transform.scale) / 100;
  const height = (frame.height * bounds.height * transform.scale) / 100;
  const right = left + width;
  const bottom = top + height;

  return (
    right <= -margin ||
    left >= viewportSize.width + margin ||
    bottom <= -margin ||
    top >= viewportSize.height + margin
  );
}

function clampAxisToFrame({
  position,
  scale,
  frameStart,
  frameSize,
  viewportStart,
  viewportSize,
  padding,
}: {
  position: number;
  scale: number;
  frameStart: number;
  frameSize: number;
  viewportStart: number;
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
      viewportStart + (viewportSize - transformedSize) / 2 - frameStart * scale;

    return clamp(
      position,
      centeredPosition - safePadding,
      centeredPosition + safePadding,
    );
  }

  const minPosition =
    viewportStart + viewportSize - (frameStart + frameSize) * scale - safePadding;
  const maxPosition = viewportStart - frameStart * scale + safePadding;

  return clamp(position, minPosition, maxPosition);
}

function clampSceneToFrame(
  transform: SceneTransform,
  frame: SvgSceneFrame,
  sceneSize: { width: number; height: number },
  paddingOverride?: { x?: number; y?: number },
  viewportArea?: { x?: number; y?: number; width?: number; height?: number },
): SceneTransform {
  const horizontalPadding = Math.min(
    Math.max(0, paddingOverride?.x ?? MAP_PAN_PADDING_X),
    sceneSize.width * 0.16,
  );
  const verticalPadding = Math.min(
    Math.max(0, paddingOverride?.y ?? MAP_PAN_PADDING_Y),
    sceneSize.height * 0.1,
  );
  const viewportX = viewportArea?.x ?? 0;
  const viewportY = viewportArea?.y ?? 0;
  const viewportWidth = viewportArea?.width ?? sceneSize.width;
  const viewportHeight = viewportArea?.height ?? sceneSize.height;

  return {
    ...transform,
    x: clampAxisToFrame({
      position: transform.x,
      scale: transform.scale,
      frameStart: frame.x,
      frameSize: frame.width,
      viewportStart: viewportX,
      viewportSize: viewportWidth,
      padding: horizontalPadding,
    }),
    y: clampAxisToFrame({
      position: transform.y,
      scale: transform.scale,
      frameStart: frame.y,
      frameSize: frame.height,
      viewportStart: viewportY,
      viewportSize: viewportHeight,
      padding: verticalPadding,
    }),
  };
}

function areNumbersClose(a: number, b: number, epsilon = 0.01) {
  return Math.abs(a - b) <= epsilon;
}

function areTransformsEquivalent(a: SceneTransform, b: SceneTransform, epsilon = 0.01) {
  return (
    areNumbersClose(a.scale, b.scale, epsilon) &&
    areNumbersClose(a.x, b.x, epsilon) &&
    areNumbersClose(a.y, b.y, epsilon)
  );
}

function arePointsEquivalent(
  a: VocabularyRegionLayout["nodePoints"],
  b: VocabularyRegionLayout["nodePoints"],
  epsilon = 0.01,
) {
  if (a.length !== b.length) {
    return false;
  }

  return a.every(
    (point, index) =>
      areNumbersClose(point.x, b[index]?.x ?? Number.NaN, epsilon) &&
      areNumbersClose(point.y, b[index]?.y ?? Number.NaN, epsilon),
  );
}

function areRegionLayoutsEquivalent(
  a: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>,
  b: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>,
  epsilon = 0.01,
) {
  const regionIds = new Set<VocabularyRegionId>([
    ...Object.keys(a),
    ...Object.keys(b),
  ] as VocabularyRegionId[]);

  for (const regionId of regionIds) {
    const left = a[regionId];
    const right = b[regionId];

    if (!left || !right) {
      if (left !== right) {
        return false;
      }
      continue;
    }

    if (
      !areNumbersClose(left.bounds.x, right.bounds.x, epsilon) ||
      !areNumbersClose(left.bounds.y, right.bounds.y, epsilon) ||
      !areNumbersClose(left.bounds.width, right.bounds.width, epsilon) ||
      !areNumbersClose(left.bounds.height, right.bounds.height, epsilon) ||
      !areNumbersClose(left.bounds.centerX, right.bounds.centerX, epsilon) ||
      !areNumbersClose(left.bounds.centerY, right.bounds.centerY, epsilon) ||
      !areNumbersClose(left.viewport.x, right.viewport.x, epsilon) ||
      !areNumbersClose(left.viewport.y, right.viewport.y, epsilon) ||
      !areNumbersClose(left.viewport.width, right.viewport.width, epsilon) ||
      !areNumbersClose(left.viewport.height, right.viewport.height, epsilon) ||
      !arePointsEquivalent(left.nodePoints, right.nodePoints, epsilon)
    ) {
      return false;
    }
  }

  return true;
}

function getVectorGraphNodeRadius(
  level: Extract<VocabularyViewLevel, "theme" | "subtheme">,
  nodeCount: number,
  node: GraphNode,
) {
  const dense = nodeCount >= 8;

  if (node.data.entityKind === "word") {
    if (level === "subtheme") {
      return dense ? 1.74 : 2.72;
    }

    return dense ? 1.8 : 3.04;
  }

  if (node.id === "home") {
    if (level === "subtheme") {
      return dense ? 2.18 : 3.25;
    }

    return dense ? 2.2 : 3.65;
  }

  if (level === "subtheme") {
    return dense ? 1.46 : 2.32;
  }

  return dense ? 1.48 : 2.68;
}

function toFramePoint(
  x: number,
  y: number,
  viewport: VocabularyRegionLayout["viewport"],
  frame: SvgSceneFrame,
) {
  return {
    x: frame.x + ((x - viewport.x) / viewport.width) * frame.width,
    y: frame.y + ((y - viewport.y) / viewport.height) * frame.height,
  };
}

function getRegionEdgeBias(bounds: VocabularyRegionLayout["bounds"]) {
  const horizontalEdgeDistance = Math.min(bounds.centerX, 100 - bounds.centerX);
  const verticalEdgeDistance = Math.min(bounds.centerY, 100 - bounds.centerY);
  const horizontalBias = 1 - clamp(horizontalEdgeDistance / 50, 0, 1);
  const verticalBias = 1 - clamp(verticalEdgeDistance / 50, 0, 1);

  return Math.max(horizontalBias * 0.82, verticalBias);
}

function getRegionFocusFrame(
  frame: SvgSceneFrame,
  bounds: VocabularyRegionLayout["bounds"],
) {
  const regionX = frame.x + (bounds.x / 100) * frame.width;
  const regionY = frame.y + (bounds.y / 100) * frame.height;
  const regionWidth = Math.max((bounds.width / 100) * frame.width, 1);
  const regionHeight = Math.max((bounds.height / 100) * frame.height, 1);
  const extraX = Math.min(frame.width * 0.18, Math.max(regionWidth * REGION_FOCUS_OVERSCAN_RATIO, 36));
  const extraY = Math.min(frame.height * 0.18, Math.max(regionHeight * REGION_FOCUS_OVERSCAN_RATIO, 30));
  const focusWidth = Math.min(regionWidth + extraX * 2, frame.width);
  const focusHeight = Math.min(regionHeight + extraY * 2, frame.height);
  const centerX = regionX + regionWidth / 2;
  const centerY = regionY + regionHeight / 2;

  return {
    x: clamp(centerX - focusWidth / 2, frame.x, frame.x + frame.width - focusWidth),
    y: clamp(centerY - focusHeight / 2, frame.y, frame.y + frame.height - focusHeight),
    width: focusWidth,
    height: focusHeight,
  };
}

function toWordLesson(
  word: VocabularyWordContent,
  audioByWordId: Map<string, string | undefined>,
  progress?: ReturnType<typeof findWordProgress>,
): VocabularyWordLesson {
  return mergeWordProgress({
    wordId: word.id,
    kanji: word.kanji ?? undefined,
    hiragana: word.hiragana ?? undefined,
    meanings: word.meanings?.filter(Boolean) ?? [],
    audio: audioByWordId.get(word.id),
    icon: word.icon ?? null,
    order: word.order ?? null,
    unlockedAt: word.unlockedAt ?? null,
    completedAt: word.completedAt ?? null,
    score: word.score ?? null,
  }, progress);
}

export default function Page() {
  const { setHidden } = useSidebar();
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, PointerPosition>());
  const dragRef = useRef<{
    start: PointerPosition;
    last: PointerPosition;
    dragged: boolean;
    regionTarget: VocabularyRegionId | null;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; center: PointerPosition } | null>(
    null,
  );
  const suppressRegionClickRef = useRef(false);
  const transformLayerRef = useRef<HTMLDivElement | null>(null);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });

  // Motion values: direct DOM updates during pan/zoom — no React re-renders
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvScale = useMotionValue(1);

  // Stable refs for values consumed in event handlers (no stale closures)
  const manualTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const autoTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const mapFrameRef = useRef<SvgSceneFrame>({ x: 0, y: 0, width: 0, height: 0 });
  const selectedRegionLayoutRef = useRef<VocabularyRegionLayout | null>(null);
  const sceneSizeRef = useRef({ width: 0, height: 0 });
  const currentLevelRef = useRef<VocabularyViewLevel>("map");
  const isNavigatingRef = useRef(false);
  const animStopRef = useRef<Array<() => void>>([]);
  const lastAutoTargetRef = useRef<SceneTransform | null>(null);
  const preservedCameraTransformRef = useRef<SceneTransform | null>(null);
  const subthemeLoadRequestRef = useRef(0);
  const zoomClassTimeoutRef = useRef<number | null>(null);
  const [hoverResetToken, setHoverResetToken] = useState(0);

  const dismissGraphHovers = useCallback(() => {
    setHoverResetToken((current) => current + 1);
  }, []);

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
  const [regionThemeGraphLoading, setRegionThemeGraphLoading] = useState(false);
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);
  const [pendingGraphNodeId, setPendingGraphNodeId] = useState<string | null>(null);
  const {
    shakingKey: shakingThemeId,
    triggerShake: triggerThemeShake,
    clearShake: clearThemeShake,
  } = useShakeFeedback<string>(LOCKED_THEME_SHAKE_DURATION_MS);
  const {
    graphs,
    selectedGraph,
    progress,
    themeCatalog,
    themeSubthemes,
    recommendedSubthemeMetaById,
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
  const graphInteractionDisabled = Boolean(
    pendingThemeId || pendingGraphNodeId || actionPendingId || subthemeWordsLoading,
  );
  const vectorGraphNodeCount = useMemo(() => {
    if (currentLevel === "theme" && selectedGraph) {
      return themeSubthemes.length;
    }

    if (currentLevel === "subtheme" && selectedSubthemeItem) {
      return subthemeWords.length;
    }

    return 0;
  }, [
    currentLevel,
    selectedGraph,
    selectedSubthemeItem,
    themeSubthemes.length,
    subthemeWords.length,
  ]);

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
    void loadJapanMapAssets().catch(() => null);
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
    return () => {
      if (zoomClassTimeoutRef.current !== null) {
        window.clearTimeout(zoomClassTimeoutRef.current);
      }
    };
  }, []);

  const loadSubthemeWordsForNode = useCallback(
    async (nodeId: string, subthemeId: string) => {
      const requestId = subthemeLoadRequestRef.current + 1;
      subthemeLoadRequestRef.current = requestId;
      setSubthemeWords([]);
      setSubthemeWordsLoading(true);

      try {
        const [words, listeningQuiz] = await Promise.all([
          listVocabularyWordsBySubthemeId(subthemeId),
          getVocabularyQuiz(nodeId, "listening"),
        ]);

        if (subthemeLoadRequestRef.current !== requestId) {
          return false;
        }

        const audioByWordId = new Map(
          listeningQuiz.questions.map((quizQuestion) => [
            quizQuestion.wordId,
            quizQuestion.audio,
          ]),
        );
        const matchedItem = progressItems.find((item) => item.nodeId === nodeId);
        setSubthemeWords(
          words.map((word) =>
            toWordLesson(word, audioByWordId, findWordProgress(matchedItem, word.id)),
          ),
        );
        return true;
      } catch (quizError) {
        console.error("Error cargando palabras del subtema:", quizError);

        if (subthemeLoadRequestRef.current === requestId) {
          setSubthemeWords([]);
        }

        return false;
      } finally {
        if (subthemeLoadRequestRef.current === requestId) {
          setSubthemeWordsLoading(false);
        }
      }
    },
    [progressItems],
  );

  useEffect(() => {
    if (!selectedSubthemeItem || subthemeWords.length === 0) {
      return;
    }

    setSubthemeWords((currentWords) =>
      currentWords.map((word) =>
        mergeWordProgress(word, findWordProgress(selectedSubthemeItem, word.wordId)),
      ),
    );
  }, [selectedSubthemeItem, subthemeWords.length]);

  useEffect(() => {
    // Reset manual transform and cancel any running animation when navigating levels
    animStopRef.current.forEach((stop) => stop());
    animStopRef.current = [];
    pointersRef.current.clear();
    dragRef.current = null;
    pinchRef.current = null;

    const preservedCamera = preservedCameraTransformRef.current;

    if (preservedCamera) {
      preservedCameraTransformRef.current = null;
      manualTransformRef.current = preservedCamera;
      lastAutoTargetRef.current = preservedCamera;
      mvX.set(preservedCamera.x);
      mvY.set(preservedCamera.y);
      mvScale.set(preservedCamera.scale);
      return;
    }

    manualTransformRef.current = { scale: 1, x: 0, y: 0 };
  }, [activeRegionId, currentLevel, mvScale, mvX, mvY]);

  useEffect(() => {
    setHidden(isLessonOpen);

    return () => {
      setHidden(false);
    };
  }, [isLessonOpen, setHidden]);

  useEffect(() => {
    if (currentLevel !== "region" || !selectedRegionId) {
      setRegionThemeGraphLoading(false);
      return;
    }

    const themeCount = selectedRegion?.themes.length ?? 0;
    const hasLayout =
      (regionLayouts[selectedRegionId]?.nodePoints?.length ?? 0) >= themeCount;
    const hasThemes = themeCount > 0;

    if (!hasThemes && regionThemeGraphLoading) {
      setRegionThemeGraphLoading(false);
      return;
    }

    if (!hasLayout || !regionThemeGraphLoading) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRegionThemeGraphLoading(false);
    }, 680);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    currentLevel,
    regionLayouts,
    regionThemeGraphLoading,
    selectedRegion,
    selectedRegionId,
  ]);

  const vectorGraphMountKey = useMemo(() => {
    if (currentLevel === "theme" && selectedGraph) {
      return `theme:${selectedGraph.graphId}:${progressItems.length}:${themeSubthemes.length}:${Object.keys(recommendedSubthemeMetaById).length}`;
    }

    if (currentLevel === "subtheme" && selectedSubthemeItem) {
      return `subtheme:${selectedSubthemeItem.nodeId}:${subthemeWords.length}`;
    }

    return null;
  }, [
    currentLevel,
    progressItems.length,
    recommendedSubthemeMetaById,
    selectedGraph,
    selectedSubthemeItem,
    themeSubthemes.length,
    subthemeWords.length,
  ]);
  const vectorGraphReady = useDeferredGraphMount(
    vectorGraphMountKey,
    VECTOR_GRAPH_MOUNT_DELAY,
  );

  const graphElements = useMemo(() => {
    if (!vectorGraphReady) {
      return null;
    }

    if (currentLevel === "subtheme" && selectedSubthemeItem) {
      return buildVocabularySubthemeGraphElements(selectedSubthemeItem, subthemeWords);
    }

    if (currentLevel === "theme" && selectedGraph) {
      return buildVocabularyThemeGraphElements(
        selectedGraph,
        progressItems,
        themeSubthemes,
        recommendedSubthemeMetaById,
      );
    }

    return null;
  }, [
    currentLevel,
    progressItems,
    recommendedSubthemeMetaById,
    selectedGraph,
    selectedSubthemeItem,
    themeSubthemes,
    subthemeWords,
    vectorGraphReady,
  ]);

  const handleRegionSelect = useCallback(
    (regionId: VocabularyRegionId) => {
      subthemeLoadRequestRef.current += 1;
      const nextRegion = regions.find((region) => region.id === regionId) ?? null;
      const hasUnlockedThemes = nextRegion?.themes.some((theme) => theme.isAvailable) ?? false;
      // Wrap level-changing state in startTransition so the click feels
      // instant — React keeps the current frame interactive and processes
      // the heavy region/graph re-renders concurrently.
      clearThemeShake();
      setRegionThemeGraphLoading(hasUnlockedThemes);
      setSelectedRegionId(regionId);
      setCurrentLevel("region");
      startTransition(() => {
        setPendingThemeId(null);
        setPendingGraphNodeId(null);
        setSubthemeWordsLoading(false);
        setSubthemeWords([]);
        setSelectedThemeId(null);
        setSelectedSubthemeNodeId(null);
        setSelectedWordId(null);
        setSelectedGraphId(null);
      });
    },
    [clearThemeShake, regions, setSelectedGraphId],
  );

  const handleRegionLayoutsChange = useCallback(
    (nextLayouts: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>) => {
      setRegionLayouts((currentLayouts) => {
        const mergedLayouts = { ...currentLayouts, ...nextLayouts };

        return areRegionLayoutsEquivalent(currentLayouts, mergedLayouts)
          ? currentLayouts
          : mergedLayouts;
      });
    },
    [],
  );

  const handleThemeSelected = useCallback(
    async (theme: VocabularyRegionThemeNode) => {
      if (!theme.isAvailable || !theme.themeId) {
        triggerThemeShake(theme.id);
        return;
      }

      clearThemeShake();
      setSelectedRegionId(theme.regionId);
      setSelectedThemeId(theme.themeId);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setSubthemeWords([]);

      if (theme.graphId) {
        setSelectedGraphId(theme.graphId);
        setCurrentLevel("theme");
        return;
      }

      setPendingThemeId(theme.themeId);

      const graphId = await createGraphFromTheme(theme.themeId);

      setPendingThemeId(null);

      if (graphId) {
        setSelectedGraphId(graphId);
        setCurrentLevel("theme");
      }
    },
    [clearThemeShake, createGraphFromTheme, setSelectedGraphId, triggerThemeShake],
  );

  const exitRegionSelection = useCallback(() => {
    setRegionThemeGraphLoading(false);
    setPendingThemeId(null);
    setPendingGraphNodeId(null);
    setSubthemeWords([]);
    setSelectedThemeId(null);
    setSelectedSubthemeNodeId(null);
    setSelectedWordId(null);
    setSelectedGraphId(null);
    setCurrentLevel("map");
  }, [setSelectedGraphId]);

  const clearRegionSelectionSilently = useCallback(() => {
    preservedCameraTransformRef.current = {
      x: mvX.get(),
      y: mvY.get(),
      scale: mvScale.get(),
    };

    setRegionThemeGraphLoading(false);
    setPendingThemeId(null);
    setPendingGraphNodeId(null);
    setSubthemeWords([]);
    setSelectedThemeId(null);
    setSelectedSubthemeNodeId(null);
    setSelectedWordId(null);
    setSelectedGraphId(null);
    setSelectedRegionId(null);
    setCurrentLevel("map");
  }, [mvScale, mvX, mvY, setSelectedGraphId]);

  const clearSelectedRegionIfOffscreen = useCallback(() => {
    if (currentLevel !== "region" || !selectedRegionId) {
      return;
    }

    const layout = regionLayouts[selectedRegionId];
    const frame = mapFrameRef.current;
    const viewportSize = sceneSizeRef.current;

    if (!layout || !viewportSize.width || !viewportSize.height) {
      return;
    }

    const currentTransform = {
      x: mvX.get(),
      y: mvY.get(),
      scale: mvScale.get(),
    };

    if (
      isRegionOutsideViewport({
        bounds: layout.bounds,
        frame,
        transform: currentTransform,
        viewportSize,
      })
    ) {
      clearRegionSelectionSilently();
    }
  }, [
    clearRegionSelectionSilently,
    currentLevel,
    mvScale,
    mvX,
    mvY,
    regionLayouts,
    selectedRegionId,
  ]);

  const handleNodeSelected = useCallback(
    async (node: GraphNode) => {
      if (node.data.entityKind === "subtheme") {
        setSelectedWordId(null);
        setPendingGraphNodeId(node.id);
        const matchedItem = progressItems.find(
          (item) =>
            item.nodeId === node.id ||
            (node.data.entityId ? item.subthemeId === node.data.entityId : false),
        );

        if (matchedItem?.subthemeId) {
          const ready = await loadSubthemeWordsForNode(
            matchedItem.nodeId,
            matchedItem.subthemeId,
          );

          if (ready) {
            setSelectedSubthemeNodeId(matchedItem.nodeId);
            setCurrentLevel("subtheme");
          }

          setPendingGraphNodeId(null);
          return;
        }

        if (node.data.entityId) {
          const subthemeId = node.data.entityId;
          const nodeId = await addSubthemeToGraph(subthemeId);

          if (nodeId) {
            const ready = await loadSubthemeWordsForNode(nodeId, subthemeId);

            if (ready) {
              setSelectedSubthemeNodeId(nodeId);
              setCurrentLevel("subtheme");
            }
          }

          setPendingGraphNodeId(null);
          return;
        }

        setPendingGraphNodeId(null);
        return;
      }

      if (node.data.entityKind === "word") {
        setSelectedWordId(node.data.entityId ?? node.id.replace(/^word-/, ""));
      }
    },
    [addSubthemeToGraph, loadSubthemeWordsForNode, progressItems],
  );

  const handleBack = useCallback(() => {
    if (currentLevel === "subtheme") {
      subthemeLoadRequestRef.current += 1;
      setPendingGraphNodeId(null);
      setSubthemeWordsLoading(false);
      setSubthemeWords([]);
      setSelectedWordId(null);
      setCurrentLevel("theme");
      return;
    }

    if (currentLevel === "theme") {
      setRegionThemeGraphLoading(false);
      setPendingThemeId(null);
      setPendingGraphNodeId(null);
      setSubthemeWords([]);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setCurrentLevel("region");
      return;
    }

    if (currentLevel === "region") {
      exitRegionSelection();
    }
  }, [currentLevel, exitRegionSelection]);

  const regionGraph =
    graphElements && (currentLevel === "theme" || currentLevel === "subtheme")
      ? {
          nodes: graphElements.nodes,
          edges: graphElements.edges,
          onNodeSelected: handleNodeSelected,
        }
      : undefined;
  const selectedRegionLayout = selectedRegion
    ? regionLayouts[selectedRegion.id]
    : null;
  const focusedVectorNodeId = useMemo(() => {
    if (
      (currentLevel === "theme" && (pendingThemeId || pendingGraphNodeId || subthemeWordsLoading || !vectorGraphReady)) ||
      (currentLevel === "subtheme" && (subthemeWordsLoading || !vectorGraphReady))
    ) {
      return null;
    }

    if (currentLevel === "subtheme" && selectedWordId) {
      return `word-${selectedWordId}`;
    }

    if (currentLevel === "subtheme") {
      return "home";
    }

    if (currentLevel === "theme") {
      return selectedSubthemeNodeId ?? "home";
    }

    return null;
  }, [
    currentLevel,
    pendingGraphNodeId,
    pendingThemeId,
    selectedSubthemeNodeId,
    selectedWordId,
    subthemeWordsLoading,
    vectorGraphReady,
  ]);
  const vectorGraphLayout = useMemo(() => {
    if (
      !regionGraph ||
      currentLevel === "region" ||
      !selectedRegionLayout?.bounds ||
      !selectedRegionLayout.viewport
    ) {
      return null;
    }

    const vectorGraphLevel: Extract<VocabularyViewLevel, "theme" | "subtheme"> =
      currentLevel === "theme" ? "theme" : "subtheme";

    return buildRegionGraphLayout(
      regionGraph.nodes,
      regionGraph.edges as GraphEdge[],
      selectedRegionLayout.bounds,
      selectedRegionLayout.nodePoints ?? null,
      selectedRegionLayout.viewport,
      (node) => getVectorGraphNodeRadius(vectorGraphLevel, regionGraph.nodes.length, node),
    );
  }, [
    currentLevel,
    regionGraph,
    selectedRegionLayout?.bounds,
    selectedRegionLayout?.nodePoints,
    selectedRegionLayout?.viewport,
  ]);
  const focusedVectorNode = useMemo(() => {
    if (!focusedVectorNodeId || !vectorGraphLayout) {
      return null;
    }

    return (
      vectorGraphLayout.nodes.find((layoutNode) => layoutNode.node.id === focusedVectorNodeId) ??
      null
    );
  }, [focusedVectorNodeId, vectorGraphLayout]);

  const autoTransform = useMemo(() => {
    if (!selectedRegion || currentLevel === "map") {
      return { scale: 1, x: 0, y: 0 };
    }

    const layout = regionLayouts[selectedRegion.id];
    const bounds = layout?.bounds;

    if (!bounds || !layout?.viewport || !sceneSize.width || !sceneSize.height) {
      return { scale: 1.8, x: 0, y: 0 };
    }

    const svgFrame = getRenderedSvgFrame(sceneSize, layout.viewport);
    const regionWidth = Math.max((bounds.width / 100) * svgFrame.width, 1);
    const regionHeight = Math.max((bounds.height / 100) * svgFrame.height, 1);
    const viewportFill = AUTO_REGION_VIEWPORT_FILL;
    const edgeBias = getRegionEdgeBias(bounds);
    const maxAutoScale = Math.min(
      MAX_SCENE_SCALE,
      AUTO_REGION_MAX_SCALE + (AUTO_REGION_EDGE_MAX_SCALE - AUTO_REGION_MAX_SCALE) * edgeBias,
    );
    const scale = clamp(
      Math.max(
        AUTO_REGION_BASE_SCALE,
        Math.min(
          maxAutoScale,
          Math.min(
            (sceneSize.width * viewportFill) / regionWidth,
            (sceneSize.height * viewportFill) / regionHeight,
          ) * (1 + edgeBias * REGION_EDGE_ZOOM_BONUS),
        ),
      ),
      AUTO_REGION_MIN_SCALE,
      maxAutoScale,
    );
    const centerX = svgFrame.x + (bounds.centerX / 100) * svgFrame.width;
    const centerY = svgFrame.y + (bounds.centerY / 100) * svgFrame.height;
    let targetX = sceneSize.width / 2;
    let targetY = sceneSize.height / 2;
    let targetScale = scale;
    const centeredRegionTransform = {
      scale,
      x: targetX - centerX * scale,
      y: targetY - centerY * scale,
    };

    if (currentLevel === "region") {
      return centeredRegionTransform;
    }

    if (focusedVectorNode) {
      const isWordFocus = focusedVectorNode.node.data.entityKind === "word";
      const isPortrait = sceneSize.height > sceneSize.width;
      const focusedPoint = toFramePoint(
        focusedVectorNode.x,
        focusedVectorNode.y,
        layout.viewport,
        svgFrame,
      );

      targetScale = clamp(
        scale * (isWordFocus ? AUTO_WORD_FOCUS_SCALE : AUTO_NODE_FOCUS_SCALE),
        isWordFocus ? 4.8 : 3.45,
        isWordFocus ? AUTO_WORD_MAX_SCALE : AUTO_NODE_MAX_SCALE,
      );

      if (isWordFocus && isLessonOpen && !isPortrait) {
        const lessonDrawerWidth = Math.min(
          LESSON_DRAWER_DESKTOP_WIDTH,
          Math.round(sceneSize.width * LESSON_DRAWER_MAX_VIEWPORT_RATIO),
        );
        const availableWidth = Math.max(sceneSize.width - lessonDrawerWidth, sceneSize.width * 0.42);
        targetX = availableWidth / 2;

        return clampSceneToFrame(
          {
            scale: targetScale,
            x: targetX - focusedPoint.x * targetScale,
            y: targetY - focusedPoint.y * targetScale,
          },
          svgFrame,
          sceneSize,
          { x: 0, y: 0 },
          { x: 0, y: 0, width: availableWidth, height: sceneSize.height },
        );
      }

      return clampSceneToFrame(
        {
          scale: targetScale,
          x: targetX - focusedPoint.x * targetScale,
          y: targetY - focusedPoint.y * targetScale,
        },
        svgFrame,
        sceneSize,
        { x: 0, y: 0 },
      );
    }

    return centeredRegionTransform;
  }, [
    currentLevel,
    focusedVectorNode,
    isLessonOpen,
    regionLayouts,
    sceneSize,
    selectedRegion,
  ]);

  // Keep refs in sync with derived React values (accessed in event handlers).
  // Consolidated into a single layout effect to avoid four separate scheduling
  // cycles per change of any of these values.
  useEffect(() => {
    autoTransformRef.current = autoTransform;
    mapFrameRef.current = mapFrame;
    selectedRegionLayoutRef.current = selectedRegionLayout ?? null;
    sceneSizeRef.current = sceneSize;
    currentLevelRef.current = currentLevel;
  }, [autoTransform, currentLevel, mapFrame, sceneSize, selectedRegionLayout]);

  // When autoTransform changes (level/region change), smoothly transition to new position
  useEffect(() => {
    const manual = manualTransformRef.current;
    // Re-clamp manual in the new auto context
    autoTransformRef.current = autoTransform;
    const clampedScale = clampManualScale(manual.scale);
    const clamped = clampManualPan({ ...manual, scale: clampedScale });
    manualTransformRef.current = clamped;
    const nextTarget = {
      x: autoTransform.x + clamped.x,
      y: autoTransform.y + clamped.y,
      scale: autoTransform.scale * clamped.scale,
    };

    if (lastAutoTargetRef.current && areTransformsEquivalent(lastAutoTargetRef.current, nextTarget)) {
      return;
    }

    lastAutoTargetRef.current = nextTarget;
    animateTransformTo(
      nextTarget.x,
      nextTarget.y,
      nextTarget.scale,
      isNavigatingRef.current,
    );
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

      const opts = { duration: CAMERA_AUTO_TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
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
      const nextScale = auto.scale * clamped.scale;
      mvX.set(auto.x + clamped.x);
      mvY.set(auto.y + clamped.y);
      mvScale.set(nextScale);
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

      transformLayerRef.current?.classList.add("is-zooming");

      if (zoomClassTimeoutRef.current !== null) {
        window.clearTimeout(zoomClassTimeoutRef.current);
      }

      zoomClassTimeoutRef.current = window.setTimeout(() => {
        transformLayerRef.current?.classList.remove("is-zooming");
        zoomClassTimeoutRef.current = null;
      }, 160);

      const totalScale = autoTransformRef.current.scale * manualTransformRef.current.scale;
      if (event.deltaY > 0 && currentLevelRef.current !== "map" && totalScale <= MIN_SCENE_SCALE + 0.04) {
        handleBack();
        return;
      }

      dismissGraphHovers();

      zoomAt(
        { x: event.clientX - rect.left, y: event.clientY - rect.top },
        event.deltaY < 0 ? WHEEL_ZOOM_IN_FACTOR : WHEEL_ZOOM_OUT_FACTOR,
      );

      window.requestAnimationFrame(() => {
        clearSelectedRegionIfOffscreen();
      });
    },
    [clearSelectedRegionIfOffscreen, dismissGraphHovers, handleBack, zoomAt],
  );

  // Add passive:false wheel listener once
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", handleWheelNative);
  }, [handleWheelNative]);

  const handlePointerDown = useCallback(
    (event: PointerEvent) => {
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
        // Capture the pointer immediately so the browser routes all subsequent
        // pointermove/pointerup to this element without changing internal routing mid-drag.
        sceneRef.current?.setPointerCapture(event.pointerId);
        dragRef.current = {
          start: position,
          last: position,
          dragged: false,
          // Save the region target here: once capture is set, event.target on
          // subsequent events (pointerup) will be the capturing element, not the
          // SVG region path.
          regionTarget: getRegionTarget(event.target),
        };
        pinchRef.current = null;
        transformLayerRef.current?.classList.add("is-dragging");
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
    (event: PointerEvent) => {
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
          dismissGraphHovers();
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
        if (!drag.dragged) {
          dismissGraphHovers();
        }
        drag.dragged = true;
        suppressRegionClickRef.current = true;
      }

      drag.last = position;

      if (drag.dragged) {
        const current = manualTransformRef.current;
        applyManualTransform({ ...current, x: current.x + deltaX, y: current.y + deltaY });
      }
    },
    [applyManualTransform, dismissGraphHovers, zoomAt],
  );

  const handlePointerEnd = useCallback(
    (event: PointerEvent) => {
      if (isOverlayTarget(event.target)) {
        pointersRef.current.delete(event.pointerId);

        if (sceneRef.current?.hasPointerCapture(event.pointerId)) {
          sceneRef.current.releasePointerCapture(event.pointerId);
        }

        if (pointersRef.current.size === 0) {
          dragRef.current = null;
          pinchRef.current = null;
          isNavigatingRef.current = false;
          if (sceneRef.current) sceneRef.current.style.cursor = "grab";
          transformLayerRef.current?.classList.remove("is-dragging");
        }

        return;
      }

      const currentDrag = dragRef.current;
      // Use the region target captured at pointerdown — event.target on pointerup
      // is the capturing element (sceneRef div) when setPointerCapture is active.
      const selectedRegionFromTarget =
        !currentDrag?.dragged && pointersRef.current.size === 1
          ? (currentDrag?.regionTarget ?? null)
          : null;

      pointersRef.current.delete(event.pointerId);

      if (sceneRef.current?.hasPointerCapture(event.pointerId)) {
        sceneRef.current.releasePointerCapture(event.pointerId);
      }

      if (pointersRef.current.size === 0) {
        dragRef.current = null;
        pinchRef.current = null;
        isNavigatingRef.current = false;
        if (sceneRef.current) sceneRef.current.style.cursor = "grab";
        transformLayerRef.current?.classList.remove("is-dragging");

        if (selectedRegionFromTarget && !suppressRegionClickRef.current) {
          handleRegionSelect(selectedRegionFromTarget);
          suppressRegionClickRef.current = true;
        } else {
          window.requestAnimationFrame(() => {
            clearSelectedRegionIfOffscreen();
          });
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
          regionTarget: null, // transitioning from pinch — no region click
        };
        pinchRef.current = null;
      }
    },
    [clearSelectedRegionIfOffscreen, handleRegionSelect],
  );

  // All pointer event listeners are native to bypass React's event delegation
  // (root bubbling, SyntheticEvent allocation, fiber tree walk). That overhead
  // is ~0.5–1 ms per call — negligible in steady state but causes a JIT-warmup
  // stutter on the very first interaction because V8 hasn't compiled those paths.
  useEffect(() => {
    const el = sceneRef.current;
    if (!el) return;
    el.addEventListener("pointerdown", handlePointerDown);
    el.addEventListener("pointermove", handlePointerMove, { passive: true });
    el.addEventListener("pointerup", handlePointerEnd);
    el.addEventListener("pointercancel", handlePointerEnd);
    return () => {
      el.removeEventListener("pointerdown", handlePointerDown);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerup", handlePointerEnd);
      el.removeEventListener("pointercancel", handlePointerEnd);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerEnd]);

  // Pre-warm: after data is loaded and the scene is sized, trigger a
  // sub-pixel micro-movement to force the browser's compositor to promote
  // the transform layer to a GPU tile and JIT-compile the Framer Motion hot
  // path. Without this, the very first drag may stutter while V8 compiles
  // and the rasterizer promotes the layer.
  useEffect(() => {
    if (loading || !sceneSize.width || !sceneSize.height) {
      return;
    }

    let secondFrame = 0;

    const firstFrame = window.requestAnimationFrame(() => {
      mvX.set(0.001);
      mvY.set(0.001);

      secondFrame = window.requestAnimationFrame(() => {
        mvX.set(0);
        mvY.set(0);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, sceneSize.width, sceneSize.height]); // mvX/mvY are stable MotionValues

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
        : vectorGraphNodeCount;

    if (!nodeCount) {
      return undefined;
    }

    const sampleCount = currentLevel === "region"
      ? Math.min(Math.max(nodeCount * 4, nodeCount + 8, 12), 28)
      : Math.min(Math.max(nodeCount * 4, nodeCount + 10, 18), 42);

    return {
      [activeRegionId]: sampleCount,
    };
  }, [
    activeRegionId,
    currentLevel,
    selectedRegion?.themes.length,
    vectorGraphNodeCount,
  ]);
  const regionThemeNodeCount = selectedRegion?.themes.length ?? 0;
  const selectedRegionLayoutPointCount = selectedRegionLayout?.nodePoints?.length ?? 0;
  const vectorGraphTargetPointCount = selectedRegion
    ? layoutCountsByRegion?.[selectedRegion.id] ?? vectorGraphNodeCount
    : vectorGraphNodeCount;
  const regionThemeLayoutReady = Boolean(
    selectedRegionLayout?.bounds &&
      selectedRegionLayout.viewport &&
      regionThemeNodeCount > 0 &&
      selectedRegionLayoutPointCount >= regionThemeNodeCount,
  );
  const vectorGraphLayoutReady = Boolean(
    selectedRegionLayout?.bounds &&
      selectedRegionLayout.viewport &&
      vectorGraphNodeCount > 0 &&
      selectedRegionLayoutPointCount >= vectorGraphTargetPointCount,
  );
  const graphTransitionLoading = Boolean(
    actionPendingId ||
      pendingThemeId ||
      pendingGraphNodeId ||
      subthemeWordsLoading ||
      regionThemeGraphLoading ||
      (currentLevel === "region" &&
        regionThemeNodeCount > 0 &&
        !regionThemeLayoutReady) ||
      ((currentLevel === "theme" || currentLevel === "subtheme") &&
        vectorGraphNodeCount > 0 &&
        (!vectorGraphReady || !graphElements || !vectorGraphLayoutReady)),
  );
  const loadingRegionId = activeRegionId && graphTransitionLoading
    ? activeRegionId
    : null;

  return (
    <div
      ref={sceneRef}
      data-help-target="graph-canvas"
      className="map-scene absolute inset-0 z-0 cursor-grab overflow-hidden touch-none select-none kanji-bg-base"
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
            ref={transformLayerRef}
            data-map-transform-layer="true"
            className="map-transform-layer absolute inset-0 z-10 bg-transparent"
            style={{
              x: mvX,
              y: mvY,
              scale: mvScale,
              originX: 0,
              originY: 0,
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
          >
            <JapanRegionMap
              regions={regions}
              selectedRegionId={activeRegionId}
              loadingRegionId={loadingRegionId}
              layoutCountsByRegion={layoutCountsByRegion}
              hoverResetToken={hoverResetToken}
              interactionDisabled={currentLevel !== "map"}
              onRegionSelect={handleMapRegionSelect}
              onLayoutChange={handleRegionLayoutsChange}
            />

            {selectedRegion && currentLevel === "region" ? (
              !graphTransitionLoading && regionThemeLayoutReady ? (
                <RegionThemeGraph
                  region={selectedRegion}
                  regionBounds={selectedRegionLayout?.bounds ?? null}
                  nodePoints={selectedRegionLayout?.nodePoints ?? null}
                  viewport={selectedRegionLayout?.viewport ?? null}
                  shakingThemeId={shakingThemeId}
                  interactionDisabled={graphInteractionDisabled}
                  onThemeSelect={handleThemeSelected}
                />
              ) : null
            ) : null}

            {selectedRegion &&
            regionGraph &&
            !graphTransitionLoading &&
            vectorGraphLayoutReady &&
            (currentLevel === "theme" || currentLevel === "subtheme") ? (
              <RegionVectorGraph
                nodes={regionGraph.nodes}
                edges={regionGraph.edges as GraphEdge[]}
                regionBounds={selectedRegionLayout?.bounds ?? null}
                nodePoints={selectedRegionLayout?.nodePoints ?? null}
                viewport={selectedRegionLayout?.viewport ?? null}
                level={currentLevel}
                interactionDisabled={graphInteractionDisabled}
                hoverResetToken={hoverResetToken}
                onNodeSelected={regionGraph.onNodeSelected}
              />
            ) : null}
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
