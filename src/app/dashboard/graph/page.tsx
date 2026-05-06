"use client";

import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, startTransition } from "react";
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
const REGION_OFFSCREEN_DESELECT_MARGIN = 24;
const CAMERA_RENDER_SCALE_EPSILON = 0.02;
const CAMERA_RENDER_SCALE_COMMIT_DELAY = 140;
const CAMERA_AUTO_TRANSITION_DURATION = 0.38;

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
    regionTarget: VocabularyRegionId | null;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; center: PointerPosition } | null>(
    null,
  );
  const suppressRegionClickRef = useRef(false);
  // Ref to the CSS transform layer. During drag we set pointer-events: none so
  // the browser skips hit-testing SVG paths and never triggers CSS :hover state
  // changes. Those changes force fill/stroke transitions (280ms) and a full
  // repaint of the compositor layer on every frame — the primary source of the
  // first-drag stutter.
  const transformLayerRef = useRef<HTMLDivElement | null>(null);
  const [sceneSize, setSceneSize] = useState({ width: 0, height: 0 });
  const [renderScale, setRenderScale] = useState(1);

  // Motion values: direct DOM updates during pan/zoom — no React re-renders
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvScale = useMotionValue(1);
  const mvLayerScale = useTransform(
    mvScale,
    (scale) => scale / Math.max(renderScale, 0.001),
  );

  // Stable refs for values consumed in event handlers (no stale closures)
  const manualTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const autoTransformRef = useRef<SceneTransform>({ scale: 1, x: 0, y: 0 });
  const mapFrameRef = useRef<SvgSceneFrame>({ x: 0, y: 0, width: 0, height: 0 });
  const sceneSizeRef = useRef({ width: 0, height: 0 });
  const currentLevelRef = useRef<VocabularyViewLevel>("map");
  const isNavigatingRef = useRef(false);
  const animStopRef = useRef<Array<() => void>>([]);
  const lastAutoTargetRef = useRef<SceneTransform | null>(null);
  const preservedCameraTransformRef = useRef<SceneTransform | null>(null);
  const renderScaleRef = useRef(1);
  const renderScaleCommitTimeoutRef = useRef<number | null>(null);
  const subthemeLoadRequestRef = useRef(0);

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

    return actionPendingId || subthemeWordsLoading || regionThemeGraphLoading
      ? activeRegionId
      : null;
  }, [
    actionPendingId,
    activeRegionId,
    regionThemeGraphLoading,
    subthemeWordsLoading,
  ]);
  const graphInteractionDisabled = Boolean(
    pendingThemeId || pendingGraphNodeId || actionPendingId || subthemeWordsLoading,
  );

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
        setSubthemeWords(words.map((word) => toWordLesson(word, audioByWordId)));
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
    [],
  );

  useEffect(() => {
    renderScaleRef.current = renderScale;
  }, [renderScale]);

  useEffect(() => {
    return () => {
      if (renderScaleCommitTimeoutRef.current !== null) {
        window.clearTimeout(renderScaleCommitTimeoutRef.current);
      }
    };
  }, []);

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
      renderScaleRef.current = preservedCamera.scale;
      setRenderScale(preservedCamera.scale);
      return;
    }

    manualTransformRef.current = { scale: 1, x: 0, y: 0 };
  }, [activeRegionId, currentLevel]);

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

    const hasLayout = Boolean(regionLayouts[selectedRegionId]?.nodePoints?.length);
    const hasThemes = Boolean(selectedRegion?.themes.length);

    if (!hasLayout || !hasThemes || !regionThemeGraphLoading) {
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
      subthemeLoadRequestRef.current += 1;
      // Wrap level-changing state in startTransition so the click feels
      // instant — React keeps the current frame interactive and processes
      // the heavy region/graph re-renders concurrently.
      setRegionThemeGraphLoading(true);
      startTransition(() => {
        setPendingThemeId(null);
        setPendingGraphNodeId(null);
        setSubthemeWordsLoading(false);
        setSubthemeWords([]);
        setSelectedRegionId(regionId);
        setSelectedThemeId(null);
        setSelectedSubthemeNodeId(null);
        setSelectedWordId(null);
        setSelectedGraphId(null);
        setCurrentLevel("region");
      });
    },
    [setSelectedGraphId],
  );

  const handleRegionLayoutsChange = useCallback(
    (nextLayouts: Partial<Record<VocabularyRegionId, VocabularyRegionLayout>>) => {
      setRegionLayouts((currentLayouts) =>
        areRegionLayoutsEquivalent(currentLayouts, nextLayouts)
          ? currentLayouts
          : nextLayouts,
      );
    },
    [],
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
    [createGraphFromTheme, setSelectedGraphId],
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

        if (node.data.isRecommendation && node.data.entityId) {
          const subthemeId = node.data.entityId;
          const nodeId = await addSubthemeToGraph(subthemeId);

          if (nodeId) {
            setSelectedSubthemeNodeId(nodeId);
            const ready = await loadSubthemeWordsForNode(nodeId, subthemeId);

            if (ready) {
              setCurrentLevel("subtheme");
            }
          }

          setPendingGraphNodeId(null);
          return;
        }

        setSelectedSubthemeNodeId(node.id);
        const matchedItem = progressItems.find((item) => item.nodeId === node.id);

        if (matchedItem?.subthemeId) {
          const ready = await loadSubthemeWordsForNode(
            matchedItem.nodeId,
            matchedItem.subthemeId,
          );

          if (ready) {
            setCurrentLevel("subtheme");
          }
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

  // Keep refs in sync with derived React values (accessed in event handlers).
  // Consolidated into a single layout effect to avoid four separate scheduling
  // cycles per change of any of these values.
  useEffect(() => {
    autoTransformRef.current = autoTransform;
    mapFrameRef.current = mapFrame;
    sceneSizeRef.current = sceneSize;
    currentLevelRef.current = currentLevel;
  }, [autoTransform, mapFrame, sceneSize, currentLevel]);

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

    if (renderScaleCommitTimeoutRef.current !== null) {
      window.clearTimeout(renderScaleCommitTimeoutRef.current);
      renderScaleCommitTimeoutRef.current = null;
    }
  }, []);

  const commitRenderScale = useCallback((scale: number) => {
    const nextScale = clamp(scale, MIN_SCENE_SCALE, MAX_SCENE_SCALE);

    if (
      !Number.isFinite(nextScale) ||
      Math.abs(renderScaleRef.current - nextScale) <= CAMERA_RENDER_SCALE_EPSILON
    ) {
      return;
    }

    renderScaleRef.current = nextScale;
    setRenderScale(nextScale);
  }, []);

  const scheduleRenderScaleCommit = useCallback(
    (scale: number, delay = CAMERA_RENDER_SCALE_COMMIT_DELAY) => {
      const nextScale = clamp(scale, MIN_SCENE_SCALE, MAX_SCENE_SCALE);

      if (
        !Number.isFinite(nextScale) ||
        Math.abs(renderScaleRef.current - nextScale) <= CAMERA_RENDER_SCALE_EPSILON
      ) {
        return;
      }

      if (renderScaleCommitTimeoutRef.current !== null) {
        window.clearTimeout(renderScaleCommitTimeoutRef.current);
      }

      renderScaleCommitTimeoutRef.current = window.setTimeout(() => {
        renderScaleCommitTimeoutRef.current = null;
        commitRenderScale(nextScale);
      }, delay);
    },
    [commitRenderScale],
  );

  // Helper: animate motion values to a target (smooth level transitions)
  const animateTransformTo = useCallback(
    (x: number, y: number, s: number, instant = false) => {
      cancelTransformAnim();
      if (instant) {
        mvX.set(x);
        mvY.set(y);
        mvScale.set(s);
        commitRenderScale(s);
        return;
      }
      const opts = { duration: CAMERA_AUTO_TRANSITION_DURATION, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };
      const cX = animate(mvX, x, opts);
      const cY = animate(mvY, y, opts);
      const cS = animate(mvScale, s, opts);
      animStopRef.current = [() => cX.stop(), () => cY.stop(), () => cS.stop()];
      scheduleRenderScaleCommit(
        s,
        CAMERA_AUTO_TRANSITION_DURATION * 1000 + CAMERA_RENDER_SCALE_COMMIT_DELAY,
      );
    },
    [cancelTransformAnim, commitRenderScale, mvX, mvY, mvScale, scheduleRenderScaleCommit],
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
      scheduleRenderScaleCommit(nextScale);
    },
    [clampManualPan, mvX, mvY, mvScale, scheduleRenderScaleCommit],
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

      window.requestAnimationFrame(() => {
        clearSelectedRegionIfOffscreen();
      });
    },
    [clearSelectedRegionIfOffscreen, handleBack, zoomAt],
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
        // Suspend hit-testing on the transform layer for the duration of this
        // drag. The browser will no longer evaluate CSS :hover on SVG paths as
        // the map translates, eliminating fill/stroke transition repaints.
        if (transformLayerRef.current) {
          transformLayerRef.current.style.pointerEvents = "none";
        }
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
          if (transformLayerRef.current) {
            transformLayerRef.current.style.pointerEvents = "";
          }
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
        if (transformLayerRef.current) {
          transformLayerRef.current.style.pointerEvents = "";
        }

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
        : regionGraph?.nodes.length;

    if (!nodeCount) {
      return undefined;
    }

    // Keep a small candidate pool to avoid recomputing a very dense region layout
    // synchronously on selection. The SVG layout cost grows quickly with count.
    const sampleCount = Math.min(Math.max(nodeCount + 4, nodeCount), 18);

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
      className="absolute inset-0 z-0 cursor-grab overflow-hidden touch-none select-none bg-[#0B0B0D]"
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
            className="map-transform-layer absolute left-0 top-0 z-10 bg-transparent"
            style={{
              x: mvX,
              y: mvY,
              scale: mvLayerScale,
              width: sceneSize.width * renderScale,
              height: sceneSize.height * renderScale,
              originX: 0,
              originY: 0,
              willChange: "transform",
              backfaceVisibility: "hidden",
              userSelect: "none",
              WebkitUserSelect: "none",
              contain: "layout paint",
            }}
          >
            <JapanRegionMap
              regions={regions}
              selectedRegionId={activeRegionId}
              loadingRegionId={loadingRegionId}
              layoutCountsByRegion={layoutCountsByRegion}
              onRegionSelect={handleMapRegionSelect}
              onLayoutChange={handleRegionLayoutsChange}
            />

            {selectedRegion && currentLevel === "region" ? (
              !regionThemeGraphLoading ? (
                <RegionThemeGraph
                  region={selectedRegion}
                  regionBounds={regionLayouts[selectedRegion.id]?.bounds ?? null}
                  nodePoints={regionLayouts[selectedRegion.id]?.nodePoints ?? null}
                  viewport={regionLayouts[selectedRegion.id]?.viewport ?? null}
                  interactionDisabled={graphInteractionDisabled}
                  onThemeSelect={handleThemeSelected}
                />
              ) : null
            ) : null}

            {selectedRegion &&
            regionGraph &&
            (currentLevel === "theme" || currentLevel === "subtheme") ? (
              <RegionVectorGraph
                nodes={regionGraph.nodes}
                edges={regionGraph.edges as GraphEdge[]}
                regionBounds={regionLayouts[selectedRegion.id]?.bounds ?? null}
                nodePoints={regionLayouts[selectedRegion.id]?.nodePoints ?? null}
                viewport={regionLayouts[selectedRegion.id]?.viewport ?? null}
                level={currentLevel}
                interactionDisabled={graphInteractionDisabled}
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
