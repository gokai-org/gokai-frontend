"use client";

import { animate, motion, useMotionValue } from "framer-motion";
import { Compass, Menu, PanelsTopLeft, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  startTransition,
  type CSSProperties,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraphGateModal } from "@/features/graph/components/GraphGateModal";
import type { GraphEdge, GraphNode } from "@/features/graph/lib/graphTypes";
import JapanRegionMap from "@/features/graph/vocabulary/components/JapanRegionMap";
import RegionThemeGraph from "@/features/graph/vocabulary/components/RegionThemeGraph";
import RegionVectorGraph from "@/features/graph/vocabulary/components/RegionVectorGraph";
import VocabularyNodePanel from "@/features/graph/vocabulary/components/VocabularyNodePanel";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import { getCurrentUser } from "@/features/auth/services/api";
import { useKanaContentAccess } from "@/features/kana/hooks/useKanaContentAccess";
import {
  useGuideTour,
  type TourStep,
} from "@/features/help/components/GuideTourProvider";
import { resolveGuideTarget } from "@/features/help/utils/guideOverlay";
import {
  createLockedBoardAccessTour,
  createVocabularyGraphContextTour,
} from "@/features/help/utils/contextualTours";
import { FIRST_RUN_SIDEBAR_PREVIEW_EVENT } from "@/features/help/utils/guideEvents";
import {
  activateFirstRunOnboardingSession,
  readPersistentFirstRunSeenPages,
  readFirstRunSeenPages,
  writePersistentFirstRunSeenPages,
  writeFirstRunSeenPages,
} from "@/features/help/utils/firstRunOnboardingState";
import {
  clearHelpContextualTourRequest,
  readHelpContextualTourRequest,
} from "@/features/help/utils/contextualTourLaunch";
import { useDeferredGraphMount } from "@/features/graph/vocabulary/hooks/useDeferredGraphMount";
import { useVocabularyGraph } from "@/features/graph/vocabulary/hooks/useVocabularyGraph";
import { readOnboardingInterestThemeIds } from "@/features/onboarding/lib/interestThemeStorage";
import { loadJapanMapAssets } from "@/features/graph/vocabulary/components/japanMap/japanMapAssets";
import { buildRegionGraphLayout } from "@/features/graph/vocabulary/lib/regionGraphLayout";
import {
  buildVocabularySubthemeGraphElements,
  buildVocabularyThemeGraphElements,
} from "@/features/graph/vocabulary/lib/vocabularyGraphBuilder";
import {
  findWordProgress,
  isWordFullyCompleted,
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
import { PremiumThemeGateModal } from "@/shared/ui/PremiumThemeGateModal";
import { PointsRewardFloat } from "@/shared/ui";
import type {
  VocabularyQuizSaveContext,
  VocabularyQuizSaveResult,
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

type VocabularyMapOverlayMetrics = {
  edge: number;
  fontSize: number;
  insetX: number;
  insetY: number;
  sideWidth: number;
};

type VocabularyGraphHistoryState = {
  currentLevel: VocabularyViewLevel;
  selectedRegionId: VocabularyRegionId | null;
  selectedThemeId: string | null;
  selectedSubthemeNodeId: string | null;
  selectedWordId: string | null;
  selectedGraphId: string | null;
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
const AUTO_REGION_MIN_SCALE = 2.9;
const AUTO_REGION_BASE_SCALE = 3.45;
const AUTO_NODE_FOCUS_SCALE = 1.58;
const AUTO_WORD_FOCUS_SCALE = 2.55;
const LOCKED_THEME_SHAKE_DURATION_MS = 640;
const REGION_FOCUS_OVERSCAN_RATIO = 0.28;
const DESKTOP_DRAWER_BREAKPOINT = 1024;
const UNLOCK_TRANSITION_DURATION_MS = 1080;
const GRAPH_HISTORY_STATE_KEY = "__vocabularyGraphState";
const GRAPH_RETURN_SNAPSHOT_STORAGE_KEY = "gokai:vocabulary-graph-return-snapshot";
const GRAPH_RETURN_PENDING_STORAGE_KEY = "gokai:vocabulary-graph-return-pending";
const JAPAN_LONGITUDE_COORDINATES = [
  { label: "130E", position: "0%" },
  { label: "134E", position: "25%" },
  { label: "138E", position: "50%" },
  { label: "142E", position: "75%" },
  { label: "146E", position: "100%" },
] as const;
const JAPAN_LATITUDE_COORDINATES = [
  { label: "47N", position: "0%" },
  { label: "43N", position: "25%" },
  { label: "39N", position: "50%" },
  { label: "35N", position: "75%" },
  { label: "31N", position: "100%" },
] as const;

function dispatchSidebarPreview(expanded: boolean) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<{ expanded: boolean }>(FIRST_RUN_SIDEBAR_PREVIEW_EVENT, {
      detail: { expanded },
    }),
  );
}

function createGraphFirstRunIntroSteps(): TourStep[] {
  return [
    {
      title: "Menú lateral",
      description:
        "Desde aquí te mueves entre explorar, repasos, estadísticas, biblioteca, chatbot, avisos, configuración y ayuda sin salir del dashboard.",
      icon: <Menu className="h-6 w-6" />,
      selector:
        '[data-help-target="dashboard-sidebar"], [data-help-target="dashboard-menu-button"]',
      spotlightPadding: 16,
      position: "right",
      onEnter: () => {
        dispatchSidebarPreview(true);
        return () => dispatchSidebarPreview(false);
      },
    },
    {
      title: "Navegación superior",
      description:
        "Esta barra te deja cambiar rápido entre vocabulario, gramática y escritura para seguir estudiando sin perder contexto.",
      icon: <PanelsTopLeft className="h-6 w-6" />,
      selector: '[data-help-target="graph-nav"]',
      spotlightPadding: 14,
      position: "bottom",
    },
    {
      title: "Pantalla principal",
      description:
        "Esta vista es tu punto de entrada al Mapa de Japón: aquí orientas tu avance, eliges una ruta y bajas hasta región, tema, subtema y palabra.",
      icon: <Sparkles className="h-6 w-6" />,
      selector: '[data-help-surface="vocabulary-graph"] [data-help-target="graph-canvas"]',
      spotlightPadding: 18,
      position: "right",
    },
  ];
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function readVocabularyGraphHistoryState(
  state: unknown,
): VocabularyGraphHistoryState | null {
  if (!state || typeof state !== "object") {
    return null;
  }

  const snapshot = (state as Record<string, unknown>)[GRAPH_HISTORY_STATE_KEY];

  if (!snapshot || typeof snapshot !== "object") {
    return null;
  }

  const record = snapshot as Record<string, unknown>;
  const currentLevel = record.currentLevel;
  const selectedRegionId = record.selectedRegionId;
  const selectedThemeId = record.selectedThemeId;
  const selectedSubthemeNodeId = record.selectedSubthemeNodeId;
  const selectedWordId = record.selectedWordId;
  const selectedGraphId = record.selectedGraphId;

  if (
    currentLevel !== "map" &&
    currentLevel !== "region" &&
    currentLevel !== "theme" &&
    currentLevel !== "subtheme"
  ) {
    return null;
  }

  return {
    currentLevel,
    selectedRegionId:
      typeof selectedRegionId === "string"
        ? (selectedRegionId as VocabularyRegionId)
        : null,
    selectedThemeId:
      typeof selectedThemeId === "string" ? selectedThemeId : null,
    selectedSubthemeNodeId:
      typeof selectedSubthemeNodeId === "string" ? selectedSubthemeNodeId : null,
    selectedWordId: typeof selectedWordId === "string" ? selectedWordId : null,
    selectedGraphId: typeof selectedGraphId === "string" ? selectedGraphId : null,
  };
}

function readVocabularyGraphSessionSnapshot(): VocabularyGraphHistoryState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(GRAPH_RETURN_SNAPSHOT_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as VocabularyGraphHistoryState;
    return parsed;
  } catch {
    return null;
  }
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

function getVocabularyMapOverlayMetrics(
  sceneSize: { width: number; height: number },
): VocabularyMapOverlayMetrics {
  return {
    edge: clamp(sceneSize.width * 0.013, 8, 12),
    fontSize: clamp(sceneSize.width * 0.0175, 8.5, 10.5),
    insetX: clamp(sceneSize.width * 0.05, 24, 52),
    insetY: clamp(sceneSize.height * 0.046, 24, 38),
    sideWidth: clamp(sceneSize.width * 0.04, 18, 24),
  };
}

function getVocabularyMapViewportArea(
  sceneSize: { width: number; height: number },
  metrics: VocabularyMapOverlayMetrics,
) {
  const width = Math.max(sceneSize.width - metrics.insetX * 2, 0);
  const height = Math.max(sceneSize.height - metrics.insetY * 2, 0);

  return {
    x: metrics.insetX,
    y: metrics.insetY,
    width,
    height,
  };
}

function getRenderedSvgFrame(
  sceneSize: { width: number; height: number },
  viewport: VocabularyRegionLayout["viewport"],
  renderArea?: { x: number; y: number; width: number; height: number },
): SvgSceneFrame {
  const areaX = renderArea?.x ?? 0;
  const areaY = renderArea?.y ?? 0;
  const areaWidth = renderArea?.width ?? sceneSize.width;
  const areaHeight = renderArea?.height ?? sceneSize.height;

  if (
    !areaWidth ||
    !areaHeight ||
    !viewport.width ||
    !viewport.height
  ) {
    return {
      x: areaX,
      y: areaY,
      width: areaWidth,
      height: areaHeight,
    };
  }

  const svgAspect = viewport.width / viewport.height;
  const sceneAspect = areaWidth / areaHeight;

  // preserveAspectRatio="xMidYMid meet": scale to FIT (no clipping, full map visible)
  if (sceneAspect > svgAspect) {
    // viewport wider than SVG → fits by HEIGHT, letterbox left/right
    const height = areaHeight;
    const width = height * svgAspect;

    return {
      x: areaX + (areaWidth - width) / 2,
      y: areaY,
      width,
      height,
    };
  }

  // viewport taller than SVG → fits by WIDTH, letterbox top/bottom
  const width = areaWidth;
  const height = width / svgAspect;

  return {
    x: areaX,
    y: areaY + (areaHeight - height) / 2,
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

function getViewportCenter(viewportArea: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const viewportX = viewportArea.x ?? 0;
  const viewportY = viewportArea.y ?? 0;
  const viewportWidth = viewportArea.width ?? 0;
  const viewportHeight = viewportArea.height ?? 0;

  return {
    x: viewportX + viewportWidth / 2,
    y: viewportY + viewportHeight / 2,
  };
}

function getMinimumScaleForCenteredPoint({
  frame,
  point,
  viewportArea,
}: {
  frame: SvgSceneFrame;
  point: PointerPosition;
  viewportArea: { x?: number; y?: number; width?: number; height?: number };
}) {
  const viewportX = viewportArea.x ?? 0;
  const viewportY = viewportArea.y ?? 0;
  const viewportWidth = viewportArea.width ?? 0;
  const viewportHeight = viewportArea.height ?? 0;
  const target = getViewportCenter(viewportArea);
  const leftDistance = Math.max(point.x - frame.x, 0.001);
  const rightDistance = Math.max(frame.x + frame.width - point.x, 0.001);
  const topDistance = Math.max(point.y - frame.y, 0.001);
  const bottomDistance = Math.max(frame.y + frame.height - point.y, 0.001);
  const minScaleX = Math.max(
    (target.x - viewportX) / leftDistance,
    (viewportX + viewportWidth - target.x) / rightDistance,
  );
  const minScaleY = Math.max(
    (target.y - viewportY) / topDistance,
    (viewportY + viewportHeight - target.y) / bottomDistance,
  );

  return Math.max(minScaleX, minScaleY, MIN_SCENE_SCALE);
}

function getCameraTransformForPoint({
  point,
  frame,
  sceneSize,
  scale,
  viewportArea,
}: {
  point: PointerPosition;
  frame: SvgSceneFrame;
  sceneSize: { width: number; height: number };
  scale: number;
  viewportArea: { x?: number; y?: number; width?: number; height?: number };
}) {
  const target = getViewportCenter(viewportArea);

  return clampSceneToFrame(
    {
      scale,
      x: target.x - point.x * scale,
      y: target.y - point.y * scale,
    },
    frame,
    sceneSize,
    { x: 0, y: 0 },
    viewportArea,
  );
}

function getCameraTransformForFocusFrame({
  focusFrame,
  frame,
  sceneSize,
  minScale,
  maxScale,
  viewportArea,
}: {
  focusFrame: SvgSceneFrame;
  frame: SvgSceneFrame;
  sceneSize: { width: number; height: number };
  minScale: number;
  maxScale: number;
  viewportArea: { x?: number; y?: number; width?: number; height?: number };
}) {
  const viewportWidth = viewportArea.width ?? sceneSize.width;
  const viewportHeight = viewportArea.height ?? sceneSize.height;
  const focusCenter = {
    x: focusFrame.x + focusFrame.width / 2,
    y: focusFrame.y + focusFrame.height / 2,
  };
  const fitScale = Math.min(
    viewportWidth / Math.max(focusFrame.width, 1),
    viewportHeight / Math.max(focusFrame.height, 1),
  );
  const centeredMinScale = getMinimumScaleForCenteredPoint({
    frame,
    point: focusCenter,
    viewportArea,
  });
  const scale = clamp(
    Math.max(AUTO_REGION_BASE_SCALE, fitScale, centeredMinScale),
    minScale,
    maxScale,
  );

  return getCameraTransformForPoint({
    point: focusCenter,
    frame,
    sceneSize,
    scale,
    viewportArea,
  });
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

function waitForValue<T>(
  readValue: () => T | null | undefined,
  timeoutMs = 2400,
  intervalMs = 80,
): Promise<T | null> {
  const currentValue = readValue();

  if (currentValue != null) {
    return Promise.resolve(currentValue);
  }

  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    const tick = () => {
      const nextValue = readValue();

      if (nextValue != null) {
        resolve(nextValue);
        return;
      }

      if (Date.now() >= deadline) {
        resolve(null);
        return;
      }

      window.setTimeout(tick, intervalMs);
    };

    window.setTimeout(tick, intervalMs);
  });
}

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setHidden } = useSidebar();
  const { activeTour, pendingTour, startTour } = useGuideTour();
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
  const selectedRegionIdRef = useRef<VocabularyRegionId | null>(null);
  const helpThemeRef = useRef<VocabularyRegionThemeNode | null>(null);
  const sceneGestureRectRef = useRef<{ left: number; top: number } | null>(null);
  const regionGraphRef = useRef<{
    nodes: GraphNode[];
    edges: GraphEdge[];
    onNodeSelected: (node: GraphNode) => void;
  } | undefined>(undefined);
  const sceneInteractionLockedRef = useRef(false);
  const lastAutoFocusKeyRef = useRef<string | null>(null);
  const pendingHistoryRestoreRef = useRef<VocabularyGraphHistoryState | null>(null);
  const historyRestoreStartedRef = useRef(false);
  const isNavigatingRef = useRef(false);
  const animStopRef = useRef<Array<() => void>>([]);
  const lastAutoTargetRef = useRef<SceneTransform | null>(null);
  const preservedCameraTransformRef = useRef<SceneTransform | null>(null);
  const subthemeLoadRequestRef = useRef(0);
  const zoomClassTimeoutRef = useRef<number | null>(null);
  const unlockTransitionTimeoutRef = useRef<number | null>(null);
  const deferredRewardTimeoutRef = useRef<number | null>(null);
  const handledDeepLinkRef = useRef<string | null>(null);
  const [hoverResetToken, setHoverResetToken] = useState(0);
  const [firstRunEnabled, setFirstRunEnabled] = useState(false);
  const [firstRunSeenStateReady, setFirstRunSeenStateReady] = useState(false);
  const [firstRunStorageUserId, setFirstRunStorageUserId] = useState<string | null>(
    null,
  );
  const [hasSavedInterests, setHasSavedInterests] = useState<boolean | null>(null);
  const [showMissingInterestsModal, setShowMissingInterestsModal] = useState(false);
  const [showVocabularyAccessModal, setShowVocabularyAccessModal] = useState(false);
  const [showPremiumThemeModal, setShowPremiumThemeModal] = useState(false);
  const [premiumThemeLabel, setPremiumThemeLabel] = useState("este interes");
  const [firstRunSeenPages, setFirstRunSeenPages] = useState<Set<string>>(
    () => new Set(),
  );

  const dismissGraphHovers = useCallback(() => {
    setHoverResetToken((current) => current + 1);
  }, []);

  const openPremiumThemeModal = useCallback((themeLabel?: string | null) => {
    setPremiumThemeLabel(themeLabel?.trim() || "este interes");
    setShowPremiumThemeModal(true);
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
  const [cultureExplorationEnabled, setCultureExplorationEnabled] = useState(false);
  const [subthemeWords, setSubthemeWords] = useState<VocabularyWordLesson[]>([]);
  const [subthemeWordsLoading, setSubthemeWordsLoading] = useState(false);
  const [regionThemeGraphLoading, setRegionThemeGraphLoading] = useState(false);
  const [pendingThemeId, setPendingThemeId] = useState<string | null>(null);
  const [pendingGraphNodeId, setPendingGraphNodeId] = useState<string | null>(null);
  const [unlockFocusWordId, setUnlockFocusWordId] = useState<string | null>(null);
  const [mapRewardFloatPoints, setMapRewardFloatPoints] = useState<number | null>(null);
  const [unlockTransition, setUnlockTransition] = useState<{
    fromNodeId: string;
    toNodeId: string;
    token: number;
  } | null>(null);
  const {
    shakingKey: shakingThemeId,
    triggerShake: triggerThemeShake,
    clearShake: clearThemeShake,
  } = useShakeFeedback<string>(LOCKED_THEME_SHAKE_DURATION_MS);
  const {
    graphs,
    selectedGraph,
    selectedGraphId: activeGraphId,
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
    reloadCatalog,
  } = useVocabularyGraph();
  const { hasKanaContentAccess, blockedMessage } = useKanaContentAccess();

  const handleMissingInterestsSaved = useCallback(async () => {
    setHasSavedInterests(true);
    await reloadCatalog();
    setShowMissingInterestsModal(false);
  }, [reloadCatalog]);

  const regions = useMemo(
    () => buildVocabularyRegionViewModels(themeCatalog, graphs),
    [graphs, themeCatalog],
  );
  const hasAvailableInterestThemes = useMemo(
    () =>
      regions.some((region) => region.themes.some((theme) => theme.isAvailable)),
    [regions],
  );
  const shouldPromptMissingInterests =
    !loading && hasSavedInterests === false && !hasAvailableInterestThemes;
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
  const selectedGraphId = selectedGraph?.graphId ?? activeGraphId ?? null;
  const selectedWord = useMemo(
    () => subthemeWords.find((word) => word.wordId === selectedWordId) ?? null,
    [selectedWordId, subthemeWords],
  );
  const requestedThemeId = searchParams.get("themeId");
  const requestedSubthemeId = searchParams.get("subthemeId");
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
  const mapOverlayMetrics = useMemo(
    () => getVocabularyMapOverlayMetrics(sceneSize),
    [sceneSize],
  );
  const mapViewportArea = useMemo(
    () => getVocabularyMapViewportArea(sceneSize, mapOverlayMetrics),
    [mapOverlayMetrics, sceneSize],
  );
  const mapFrameStyle = useMemo(
    () =>
      ({
        "--vocabulary-map-coordinate-edge": `${mapOverlayMetrics.edge}px`,
        "--vocabulary-map-coordinate-font-size": `${mapOverlayMetrics.fontSize}px`,
        "--vocabulary-map-coordinate-inset-x": `${mapOverlayMetrics.insetX}px`,
        "--vocabulary-map-coordinate-inset-y": `${mapOverlayMetrics.insetY}px`,
        "--vocabulary-map-coordinate-side-width": `${mapOverlayMetrics.sideWidth}px`,
      }) as CSSProperties,
    [mapOverlayMetrics],
  );
  const mapSafeAreaStyle = useMemo(
    () =>
      ({
        left: mapViewportArea.x,
        top: mapViewportArea.y,
        width: mapViewportArea.width,
        height: mapViewportArea.height,
      }) satisfies CSSProperties,
    [mapViewportArea],
  );
  const mapFrame = useMemo(
    () =>
      mapViewport
        ? getRenderedSvgFrame(sceneSize, mapViewport, mapViewportArea)
        : { x: 0, y: 0, width: sceneSize.width, height: sceneSize.height },
    [mapViewport, mapViewportArea, sceneSize],
  );
  const graphInteractionDisabled = Boolean(
    pendingThemeId ||
      pendingGraphNodeId ||
      actionPendingId ||
      subthemeWordsLoading,
  );
  const helpRegion = useMemo(
    () =>
      regions.find((region) => region.themes.some((theme) => theme.isAvailable)) ??
      regions.find((region) => region.themes.length > 0) ??
      null,
    [regions],
  );
  const helpTheme = useMemo(
    () =>
      helpRegion?.themes.find((theme) => theme.isAvailable) ??
      helpRegion?.themes[0] ??
      null,
    [helpRegion],
  );

  useEffect(() => {
    helpThemeRef.current = helpTheme;
  }, [helpTheme]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      const isActive = activateFirstRunOnboardingSession();
      const sessionSeenPages = isActive ? readFirstRunSeenPages() : new Set<string>();

      setFirstRunEnabled(isActive);

      void getCurrentUser()
        .catch(() => null)
        .then((user) => {
          if (cancelled) {
            return;
          }

          const nextUserId = typeof user?.id === "string" ? user.id : null;
          const persistentSeenPages = readPersistentFirstRunSeenPages(nextUserId);
          const mergedSeenPages = new Set([
            ...sessionSeenPages,
            ...persistentSeenPages,
          ]);
          const savedInterestThemeIds = nextUserId
            ? readOnboardingInterestThemeIds(nextUserId)
            : [];

          setFirstRunStorageUserId(nextUserId);
          setHasSavedInterests(nextUserId ? savedInterestThemeIds.length > 0 : null);
          setFirstRunSeenPages(mergedSeenPages);

          if (isActive) {
            writeFirstRunSeenPages(mergedSeenPages);
          }

          if (mergedSeenPages.size > 0) {
            writePersistentFirstRunSeenPages(mergedSeenPages, nextUserId);
          }

          setFirstRunSeenStateReady(true);
        });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const markGraphFirstRunSeen = useCallback(() => {
    setFirstRunSeenPages((current) => {
      if (current.has("graph")) {
        return current;
      }

      const next = new Set(current);
      next.add("graph");
      writeFirstRunSeenPages(next);
      writePersistentFirstRunSeenPages(next, firstRunStorageUserId);
      return next;
    });
  }, [firstRunStorageUserId]);

  const progressItemsRef = useRef(progressItems);
  const themeSubthemesRef = useRef(themeSubthemes);
  const subthemeWordsRef = useRef(subthemeWords);
  const selectedGraphIdRef = useRef<string | null>(selectedGraphId);

  useEffect(() => {
    progressItemsRef.current = progressItems;
  }, [progressItems]);

  useEffect(() => {
    themeSubthemesRef.current = themeSubthemes;
  }, [themeSubthemes]);

  useEffect(() => {
    subthemeWordsRef.current = subthemeWords;
  }, [subthemeWords]);

  useEffect(() => {
    selectedGraphIdRef.current = selectedGraphId;
  }, [selectedGraphId]);
  const historySnapshot = useMemo<VocabularyGraphHistoryState>(() => ({
    currentLevel,
    selectedRegionId,
    selectedThemeId,
    selectedSubthemeNodeId,
    selectedWordId,
    selectedGraphId,
  }), [
    currentLevel,
    selectedGraphId,
    selectedRegionId,
    selectedSubthemeNodeId,
    selectedThemeId,
    selectedWordId,
  ]);
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
      if (unlockTransitionTimeoutRef.current !== null) {
        window.clearTimeout(unlockTransitionTimeoutRef.current);
      }
      if (deferredRewardTimeoutRef.current !== null) {
        window.clearTimeout(deferredRewardTimeoutRef.current);
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
          getVocabularyQuiz(nodeId, "listening").catch(() => null),
        ]);

        if (subthemeLoadRequestRef.current !== requestId) {
          return false;
        }

        const audioByWordId = new Map(
          (listeningQuiz?.questions ?? []).map((quizQuestion) => [
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
    if (!showMissingInterestsModal || shouldPromptMissingInterests) {
      return;
    }

    setShowMissingInterestsModal(false);
  }, [shouldPromptMissingInterests, showMissingInterestsModal]);

  useEffect(() => {
    setHidden(
      isLessonOpen ||
        showMissingInterestsModal ||
        showVocabularyAccessModal ||
        showPremiumThemeModal,
    );

    return () => {
      setHidden(false);
    };
  }, [
    isLessonOpen,
    setHidden,
    showMissingInterestsModal,
    showPremiumThemeModal,
    showVocabularyAccessModal,
  ]);

  useEffect(() => {
    const shouldRestoreFromSession =
      window.sessionStorage.getItem(GRAPH_RETURN_PENDING_STORAGE_KEY) === "1";

    const sessionSnapshot = shouldRestoreFromSession
      ? readVocabularyGraphSessionSnapshot()
      : null;

    pendingHistoryRestoreRef.current =
      sessionSnapshot ?? readVocabularyGraphHistoryState(window.history.state);

    if (shouldRestoreFromSession) {
      window.sessionStorage.removeItem(GRAPH_RETURN_PENDING_STORAGE_KEY);
      window.sessionStorage.removeItem(GRAPH_RETURN_SNAPSHOT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    const nextHistoryState = {
      ...(window.history.state ?? {}),
      [GRAPH_HISTORY_STATE_KEY]: historySnapshot,
    };

    window.history.replaceState(nextHistoryState, "", window.location.href);
  }, [historySnapshot]);

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
      return buildVocabularySubthemeGraphElements(selectedSubthemeItem, subthemeWords, {
        hasKanaContentAccess,
      });
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
    hasKanaContentAccess,
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
      if (shouldPromptMissingInterests) {
        setShowMissingInterestsModal(true);
        return;
      }

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
    [clearThemeShake, regions, setSelectedGraphId, shouldPromptMissingInterests],
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
      if (shouldPromptMissingInterests) {
        setShowMissingInterestsModal(true);
        return;
      }

      if (!theme.themeId) {
        triggerThemeShake(theme.id);
        return;
      }

      if (!theme.isAvailable) {
        openPremiumThemeModal(theme.label);
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
    [
      clearThemeShake,
      createGraphFromTheme,
      openPremiumThemeModal,
      setSelectedGraphId,
      shouldPromptMissingInterests,
      triggerThemeShake,
    ],
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

  const handleVocabularyQuizSaved = useCallback(
    async ({ wordId, response }: VocabularyQuizSaveContext): Promise<VocabularyQuizSaveResult> => {
      const previousItem = selectedSubthemeItem;
      const previousWordProgress = findWordProgress(previousItem, wordId);
      const nextProgress = await reloadProgress();
      const nextItem = nextProgress?.items?.find(
        (item) => item.nodeId === previousItem?.nodeId,
      ) ?? null;
      const nextWordProgress = findWordProgress(nextItem, wordId);
      const nextUnlockedWordId =
        nextItem?.currentWordId && nextItem.currentWordId !== wordId
          ? nextItem.currentWordId
          : null;
      const wordJustCompleted =
        !isWordFullyCompleted(previousWordProgress) &&
        isWordFullyCompleted(nextWordProgress);
      const shouldRunUnlockSequence =
        sceneSizeRef.current.width >= DESKTOP_DRAWER_BREAKPOINT &&
        wordJustCompleted &&
        Boolean(nextUnlockedWordId);

      if (!shouldRunUnlockSequence || !nextUnlockedWordId) {
        return { closeQuiz: false };
      }

      if (unlockTransitionTimeoutRef.current !== null) {
        window.clearTimeout(unlockTransitionTimeoutRef.current);
      }

      if (deferredRewardTimeoutRef.current !== null) {
        window.clearTimeout(deferredRewardTimeoutRef.current);
      }

      dismissGraphHovers();
      setUnlockFocusWordId(nextUnlockedWordId);
      setUnlockTransition({
        fromNodeId: `word-${wordId}`,
        toNodeId: `word-${nextUnlockedWordId}`,
        token: Date.now(),
      });

      unlockTransitionTimeoutRef.current = window.setTimeout(() => {
        setUnlockTransition(null);
        unlockTransitionTimeoutRef.current = null;
      }, UNLOCK_TRANSITION_DURATION_MS);

      if ((response.pointsAwarded ?? 0) > 0) {
        deferredRewardTimeoutRef.current = window.setTimeout(() => {
          setMapRewardFloatPoints(response.pointsAwarded ?? null);
          deferredRewardTimeoutRef.current = null;
        }, UNLOCK_TRANSITION_DURATION_MS + 120);
      }

      return { closeQuiz: true };
    },
    [dismissGraphHovers, reloadProgress, selectedSubthemeItem],
  );

  const handleNodeSelected = useCallback(
    async (node: GraphNode) => {
      if (node.data.entityKind === "subtheme") {
        if (shouldPromptMissingInterests) {
          setShowMissingInterestsModal(true);
          return;
        }

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
        if (shouldPromptMissingInterests) {
          setShowMissingInterestsModal(true);
          return;
        }

        if (!hasKanaContentAccess) {
          setShowVocabularyAccessModal(true);
          return;
        }

        setUnlockFocusWordId(null);
        setSelectedWordId(node.data.entityId ?? node.id.replace(/^word-/, ""));
      }
    },
    [
      addSubthemeToGraph,
      hasKanaContentAccess,
      loadSubthemeWordsForNode,
      progressItems,
      shouldPromptMissingInterests,
    ],
  );

  const handleBack = useCallback(() => {
    if (currentLevel === "subtheme") {
      subthemeLoadRequestRef.current += 1;
      setPendingGraphNodeId(null);
      setSubthemeWordsLoading(false);
      setSubthemeWords([]);
      setSelectedWordId(null);
      setUnlockFocusWordId(null);
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
      setUnlockFocusWordId(null);
      setCurrentLevel("region");
      return;
    }

    if (currentLevel === "region") {
      exitRegionSelection();
    }
  }, [currentLevel, exitRegionSelection]);

  const handleNavigateToLibrary = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.sessionStorage.setItem(
      GRAPH_RETURN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(historySnapshot),
    );
    window.sessionStorage.removeItem(GRAPH_RETURN_PENDING_STORAGE_KEY);
  }, [historySnapshot]);

  const resetVocabularyHelpState = useCallback(() => {
    if (typeof document !== "undefined") {
      const helpAction = document.querySelector(
        '[data-help-target="vocabulary-help-action-culture-exploration-mode"]',
      );
      const helpButton = document.querySelector(
        '[data-help-target="vocabulary-help-button"]',
      );

      if (helpAction && helpButton instanceof HTMLElement) {
        helpButton.click();
      }
    }

    subthemeLoadRequestRef.current += 1;
    dismissGraphHovers();
    clearThemeShake();
    setRegionThemeGraphLoading(false);
    setPendingThemeId(null);
    setPendingGraphNodeId(null);
    setSubthemeWordsLoading(false);
    setSubthemeWords([]);
    setSelectedThemeId(null);
    setSelectedSubthemeNodeId(null);
    setSelectedWordId(null);
    setUnlockFocusWordId(null);
    setSelectedGraphId(null);
    setSelectedRegionId(null);
    setCurrentLevel("map");
  }, [clearThemeShake, dismissGraphHovers, setSelectedGraphId]);

  const enterCultureExplorationMode = useCallback(() => {
    setCultureExplorationEnabled(true);
    dismissGraphHovers();
    resetVocabularyHelpState();
  }, [dismissGraphHovers, resetVocabularyHelpState]);

  const disableCultureExplorationMode = useCallback(() => {
    setCultureExplorationEnabled(false);
    dismissGraphHovers();
  }, [dismissGraphHovers]);

  const focusHelpMap = useCallback(() => {
    setCultureExplorationEnabled(false);
    resetVocabularyHelpState();
  }, [resetVocabularyHelpState]);

  const helpRegionSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-selected-region"]';
  const helpThemeSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-theme-node"]';
  const helpRecommendedSubthemeSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-recommended-subtheme-node"]';
  const helpWordSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-word-node"]';
  const helpLessonSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="lesson-drawer"]';
  const helpButtonSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-help-button"]';
  const helpCultureActionSelector =
    '[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-help-action-culture-exploration-mode"]';

  const waitForHelpTarget = useCallback(
    (selector: string, timeoutMs = 3200) =>
      waitForValue(
        () =>
          typeof document === "undefined"
            ? null
            : resolveGuideTarget(selector, { includeOffscreen: true }),
        timeoutMs,
        80,
      ),
    [],
  );

  const waitForHelpRecommendedNode = useCallback(
    () =>
      waitForValue(
        () => {
          if (currentLevelRef.current !== "theme") {
            return null;
          }

          return regionGraphRef.current?.nodes.find(
            (node) =>
              node.id !== "home" &&
              node.data.entityKind === "subtheme" &&
              node.data.status !== "locked" &&
              node.data.isAiRecommended,
          ) ?? null;
        },
        6000,
        80,
      ),
    [],
  );

  const waitForHelpWordGraphNode = useCallback(
    () =>
      waitForValue(
        () => {
          if (currentLevelRef.current !== "subtheme") {
            return null;
          }

          return regionGraphRef.current?.nodes.find(
            (node) =>
              node.id !== "home" &&
              node.data.entityKind === "word" &&
              node.data.status !== "locked",
          ) ?? null;
        },
        8000,
        80,
      ),
    [],
  );

  const clickHelpTarget = useCallback((selector: string) => {
    if (typeof document === "undefined") {
      return false;
    }

    const target = resolveGuideTarget(selector, { includeOffscreen: true });

    if (!target) {
      return false;
    }

    target.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
      }),
    );
    return true;
  }, []);

  const focusHelpRegion = useCallback(async () => {
    if (!helpRegion) {
      return false;
    }

    setCultureExplorationEnabled(false);
    dismissGraphHovers();
    handleRegionSelect(helpRegion.id);

    const regionTarget = await waitForHelpTarget(helpRegionSelector);

    return Boolean(regionTarget);
  }, [
    dismissGraphHovers,
    handleRegionSelect,
    helpRegion,
    helpRegionSelector,
    waitForHelpTarget,
  ]);

  const ensureHelpRegionFocused = useCallback(async () => {
    if (!helpRegion) {
      return false;
    }

    if (selectedRegionIdRef.current === helpRegion.id && currentLevelRef.current === "region") {
      const regionTarget = await waitForHelpTarget(helpRegionSelector);
      return Boolean(regionTarget);
    }

    return focusHelpRegion();
  }, [
    focusHelpRegion,
    helpRegion,
    helpRegionSelector,
    waitForHelpTarget,
  ]);

  const focusHelpThemeNode = useCallback(async () => {
    if (!helpRegion || !helpTheme) {
      return false;
    }

    const regionReady = await ensureHelpRegionFocused();

    if (!regionReady) {
      return false;
    }

    const themeTarget = await waitForHelpTarget(helpThemeSelector);

    return Boolean(themeTarget);
  }, [
    ensureHelpRegionFocused,
    helpRegion,
    helpTheme,
    helpThemeSelector,
    waitForHelpTarget,
  ]);

  const focusHelpRecommendedSubtheme = useCallback(async () => {
    const freshTheme = helpThemeRef.current;

    if (!freshTheme) {
      return false;
    }

    setCultureExplorationEnabled(false);
    dismissGraphHovers();
    await handleThemeSelected(freshTheme);

    const recommendedNode = await waitForHelpRecommendedNode();

    if (!recommendedNode) {
      return false;
    }

    const recommendedTarget = await waitForHelpTarget(
      helpRecommendedSubthemeSelector,
      6000,
    );

    return Boolean(recommendedTarget);
  }, [
    dismissGraphHovers,
    handleThemeSelected,
    helpRecommendedSubthemeSelector,
    waitForHelpRecommendedNode,
    waitForHelpTarget,
  ]);

  const focusHelpWordNode = useCallback(async () => {
    const recommendedReady = await focusHelpRecommendedSubtheme();

    if (!recommendedReady) {
      return false;
    }

    const recommendedNode = await waitForHelpRecommendedNode();

    if (!recommendedNode) {
      return false;
    }

    await handleNodeSelected(recommendedNode);

    const wordNode = await waitForHelpWordGraphNode();

    if (!wordNode) {
      return false;
    }

    const wordTarget = await waitForHelpTarget(helpWordSelector, 6000);

    return Boolean(wordTarget);
  }, [
    focusHelpRecommendedSubtheme,
    handleNodeSelected,
    helpWordSelector,
    waitForHelpRecommendedNode,
    waitForHelpWordGraphNode,
    waitForHelpTarget,
  ]);

  const openHelpLesson = useCallback(async () => {
    const ready = await focusHelpWordNode();

    if (!ready) {
      return false;
    }

    const wordNode = await waitForHelpWordGraphNode();

    if (!wordNode) {
      return false;
    }

    setUnlockFocusWordId(null);
    setSelectedWordId(wordNode.data.entityId ?? wordNode.id.replace(/^word-/, ""));

    const lessonTarget = await waitForHelpTarget(helpLessonSelector);

    return Boolean(lessonTarget);
  }, [
    focusHelpWordNode,
    helpLessonSelector,
    waitForHelpWordGraphNode,
    waitForHelpTarget,
  ]);

  const ensureHelpLessonOpen = useCallback(async () => {
    const existingLesson =
      typeof document === "undefined"
        ? null
        : resolveGuideTarget(helpLessonSelector, { includeOffscreen: true });

    const matchesGuideRegion = selectedRegionId === helpRegion?.id;
    const matchesGuideTheme = selectedThemeId === helpTheme?.themeId;
    const hasGuideLessonContext =
      Boolean(existingLesson) &&
      matchesGuideRegion &&
      matchesGuideTheme &&
      currentLevel === "subtheme" &&
      Boolean(selectedSubthemeNodeId) &&
      Boolean(selectedWordId) &&
      isLessonOpen;

    if (hasGuideLessonContext) {
      return true;
    }

    return openHelpLesson();
  }, [
    currentLevel,
    helpLessonSelector,
    helpRegion,
    helpTheme,
    isLessonOpen,
    openHelpLesson,
    selectedRegionId,
    selectedSubthemeNodeId,
    selectedThemeId,
    selectedWordId,
  ]);

  const focusHelpLessonTab = useCallback(
    async (tab: "meaning" | "listening" | "speaking" | "writing") => {
      const lessonOpen = await ensureHelpLessonOpen();

      if (!lessonOpen) {
        return false;
      }

      const tabSelector = `[data-help-surface="vocabulary-graph"] [data-help-target="lesson-section-tab-${tab}"]`;
      const contentSelector = `[data-help-surface="vocabulary-graph"] [data-help-target="vocabulary-lesson-exercise-${tab}"]`;

      const tabTarget = await waitForHelpTarget(tabSelector);

      if (!tabTarget) {
        return false;
      }

      clickHelpTarget(tabSelector);

      const contentTarget = await waitForHelpTarget(contentSelector);
      return Boolean(contentTarget);
    },
    [clickHelpTarget, ensureHelpLessonOpen, waitForHelpTarget],
  );

  const focusCultureModeAction = useCallback(async () => {
    setSelectedWordId(null);
    setUnlockFocusWordId(null);
    dismissGraphHovers();

    const regionReady = await ensureHelpRegionFocused();

    if (!regionReady) {
      return false;
    }

    const helpButton = await waitForHelpTarget(helpButtonSelector);

    if (!helpButton) {
      return false;
    }

    const existingAction =
      typeof document === "undefined"
        ? null
        : resolveGuideTarget(helpCultureActionSelector, { includeOffscreen: true });

    if (!existingAction) {
      const opened = clickHelpTarget(helpButtonSelector);

      if (!opened) {
        return false;
      }
    }

    const cultureAction = await waitForHelpTarget(helpCultureActionSelector);
    return Boolean(cultureAction);
  }, [
    clickHelpTarget,
    dismissGraphHovers,
    ensureHelpRegionFocused,
    helpButtonSelector,
    helpCultureActionSelector,
    waitForHelpTarget,
  ]);

  const buildHelpTour = useCallback(() => {
    if (!helpRegion || !helpTheme) {
      return createLockedBoardAccessTour({
        id: "vocabulary-context-tour-locked",
        title: "Guía de Vocabulario",
        scopeSelector: '[data-help-surface="vocabulary-graph"]',
        boardLabel: "Mapa de vocabulario",
        requirementLabel: hasKanaContentAccess
          ? "tener al menos una región y un tema disponibles"
          : blockedMessage,
        targetName: "graph-canvas",
      });
    }

    return createVocabularyGraphContextTour({
      id: "vocabulary-context-tour",
      title: "Guía de Vocabulario",
      route: "/dashboard/graph",
      scopeSelector: '[data-help-surface="vocabulary-graph"]',
      focusMap: focusHelpMap,
      focusRegion: async () => {
        await focusHelpRegion();
      },
      focusThemeNode: async () => {
        await focusHelpThemeNode();
      },
      focusRecommendedSubtheme: async () => {
        await focusHelpRecommendedSubtheme();
      },
      focusWordNode: async () => {
        await focusHelpWordNode();
      },
      focusLessonTab: async (tab) => {
        await focusHelpLessonTab(tab);
      },
      openLesson: async () => {
        await openHelpLesson();
      },
      focusCultureModeAction: async () => {
        await focusCultureModeAction();
      },
      resetTourState: resetVocabularyHelpState,
    });
  }, [blockedMessage, focusCultureModeAction, focusHelpLessonTab, focusHelpMap, focusHelpRecommendedSubtheme, focusHelpRegion, focusHelpThemeNode, focusHelpWordNode, hasKanaContentAccess, helpRegion, helpTheme, openHelpLesson, resetVocabularyHelpState]);

  const buildFirstRunTour = useCallback(() => {
    const baseTour = buildHelpTour();

    return {
      ...baseTour,
      id: `first-run-${baseTour.id}`,
      title: "Primer recorrido",
      steps: [...createGraphFirstRunIntroSteps(), ...baseTour.steps],
      onClose: () => {
        baseTour.onClose?.();
        markGraphFirstRunSeen();
      },
    };
  }, [buildHelpTour, markGraphFirstRunSeen]);

  useEffect(() => {
    if (loading || activeTour || pendingTour) {
      return;
    }

    if (readHelpContextualTourRequest() !== "vocabulary-graph") {
      return;
    }

    clearHelpContextualTourRequest();
    startTour(buildHelpTour());
  }, [activeTour, buildHelpTour, loading, pendingTour, startTour]);

  useEffect(() => {
    if (
      loading ||
      !firstRunEnabled ||
      !firstRunSeenStateReady ||
      firstRunSeenPages.has("graph") ||
      activeTour ||
      pendingTour
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      markGraphFirstRunSeen();
      startTour(buildFirstRunTour());
    }, 220);

    return () => window.clearTimeout(timeoutId);
  }, [
    activeTour,
    buildFirstRunTour,
    firstRunEnabled,
    firstRunSeenStateReady,
    firstRunSeenPages,
    loading,
    markGraphFirstRunSeen,
    pendingTour,
    startTour,
  ]);

  useEffect(() => {
    if (loading || historyRestoreStartedRef.current) {
      return;
    }

    const snapshot = pendingHistoryRestoreRef.current;

    if (!snapshot) {
      historyRestoreStartedRef.current = true;
      return;
    }

    historyRestoreStartedRef.current = true;
    pendingHistoryRestoreRef.current = null;

    let cancelled = false;

    const restoreGraphState = async () => {
      setPendingThemeId(null);
      setPendingGraphNodeId(null);
      setUnlockFocusWordId(null);
      setSelectedGraphId(snapshot.selectedGraphId);
      setSelectedRegionId(snapshot.selectedRegionId);
      setSelectedThemeId(snapshot.selectedThemeId);
      setSelectedSubthemeNodeId(null);
      setSelectedWordId(null);
      setSubthemeWords([]);
      setSubthemeWordsLoading(false);

      if (snapshot.currentLevel === "map" || !snapshot.selectedRegionId) {
        if (!cancelled) {
          setCurrentLevel("map");
        }
        return;
      }

      if (!cancelled) {
        setCurrentLevel(snapshot.currentLevel === "region" ? "region" : "theme");
      }

      if (snapshot.currentLevel !== "subtheme" || !snapshot.selectedSubthemeNodeId) {
        return;
      }

      const matchedItem = progressItems.find(
        (item) => item.nodeId === snapshot.selectedSubthemeNodeId,
      );

      if (!matchedItem?.subthemeId) {
        return;
      }

      const ready = await loadSubthemeWordsForNode(
        matchedItem.nodeId,
        matchedItem.subthemeId,
      );

      if (!ready || cancelled) {
        return;
      }

      setSelectedSubthemeNodeId(matchedItem.nodeId);
      setCurrentLevel("subtheme");

      if (snapshot.selectedWordId) {
        setSelectedWordId(snapshot.selectedWordId);
      }
    };

    void restoreGraphState();

    return () => {
      cancelled = true;
    };
  }, [loading, loadSubthemeWordsForNode, progressItems, setSelectedGraphId]);

  useEffect(() => {
    const deepLinkKey = `${requestedThemeId ?? ""}:${requestedSubthemeId ?? ""}`;

    if (loading || deepLinkKey === ":") {
      return;
    }

    if (handledDeepLinkRef.current === deepLinkKey) {
      return;
    }

    let cancelled = false;

    const openRequestedStudyPoint = async () => {
      let activeThemeId = requestedThemeId;

      if (requestedThemeId) {
        const matchedTheme = regions
          .flatMap((region) => region.themes)
          .find((theme) => theme.themeId === requestedThemeId);

        if (matchedTheme?.themeId) {
          setSelectedRegionId(matchedTheme.regionId);
          setSelectedThemeId(matchedTheme.themeId);
          setSelectedSubthemeNodeId(null);
          setSelectedWordId(null);
          setSubthemeWords([]);

          const nextGraphId =
            matchedTheme.graphId ??
            (selectedGraph?.themeId === matchedTheme.themeId
              ? selectedGraph.graphId
              : null) ??
            (await createGraphFromTheme(matchedTheme.themeId));

          if (cancelled) {
            return;
          }

          if (nextGraphId) {
            setSelectedGraphId(nextGraphId);
            setCurrentLevel("theme");
          }

          activeThemeId = matchedTheme.themeId;
        }
      }

      if (!requestedSubthemeId) {
        handledDeepLinkRef.current = deepLinkKey;
        return;
      }

      const matchedProgressItem = progressItems.find(
        (item) => item.subthemeId === requestedSubthemeId,
      );

      if (matchedProgressItem?.subthemeId) {
        const ready = await loadSubthemeWordsForNode(
          matchedProgressItem.nodeId,
          matchedProgressItem.subthemeId,
        );

        if (!ready || cancelled) {
          return;
        }

        setSelectedSubthemeNodeId(matchedProgressItem.nodeId);
        setSelectedWordId(null);
        setCurrentLevel("subtheme");
        handledDeepLinkRef.current = deepLinkKey;
        return;
      }

      if (activeThemeId && selectedGraph?.themeId !== activeThemeId) {
        return;
      }

      if (!themeSubthemes.some((subtheme) => subtheme.id === requestedSubthemeId)) {
        return;
      }

      const nodeId = await addSubthemeToGraph(requestedSubthemeId);

      if (!nodeId || cancelled) {
        return;
      }

      const ready = await loadSubthemeWordsForNode(nodeId, requestedSubthemeId);

      if (!ready || cancelled) {
        return;
      }

      setSelectedSubthemeNodeId(nodeId);
      setSelectedWordId(null);
      setCurrentLevel("subtheme");
      handledDeepLinkRef.current = deepLinkKey;
    };

    void openRequestedStudyPoint();

    return () => {
      cancelled = true;
    };
  }, [
    addSubthemeToGraph,
    createGraphFromTheme,
    loadSubthemeWordsForNode,
    loading,
    progressItems,
    regions,
    requestedSubthemeId,
    requestedThemeId,
    selectedGraph,
    setSelectedGraphId,
    themeSubthemes,
  ]);

  const regionGraph = useMemo(() => {
    if (!graphElements || (currentLevel !== "theme" && currentLevel !== "subtheme")) {
      return undefined;
    }

    return {
      nodes: graphElements.nodes,
      edges: graphElements.edges,
      onNodeSelected: handleNodeSelected,
    };
  }, [currentLevel, graphElements, handleNodeSelected]);

  useEffect(() => {
    regionGraphRef.current = regionGraph;
  }, [regionGraph]);

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

    if (currentLevel === "subtheme" && unlockFocusWordId) {
      return `word-${unlockFocusWordId}`;
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
    unlockFocusWordId,
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
  const sceneInteractionLocked =
    isLessonOpen && sceneSize.width < DESKTOP_DRAWER_BREAKPOINT;
  const autoFocusKey = useMemo(() => {
    if (currentLevel === "region" && selectedRegionId) {
      return `region:${selectedRegionId}`;
    }

    if (!focusedVectorNodeId) {
      return null;
    }

    const drawerAwareWordFocus =
      currentLevel === "subtheme" &&
      Boolean(selectedWordId) &&
      isLessonOpen &&
      sceneSize.width >= DESKTOP_DRAWER_BREAKPOINT;

    return `${currentLevel}:${focusedVectorNodeId}:${drawerAwareWordFocus ? "drawer" : "plain"}`;
  }, [currentLevel, focusedVectorNodeId, isLessonOpen, sceneSize.width, selectedRegionId, selectedWordId]);

  const autoTransform = useMemo(() => {
    if (!selectedRegion || currentLevel === "map") {
      return { scale: 1, x: 0, y: 0 };
    }

    const layout = regionLayouts[selectedRegion.id];
    const bounds = layout?.bounds;

    if (!bounds || !layout?.viewport || !sceneSize.width || !sceneSize.height) {
      return { scale: 1.8, x: 0, y: 0 };
    }

    const svgFrame = getRenderedSvgFrame(
      sceneSize,
      layout.viewport,
      mapViewportArea,
    );
    const regionFocusFrame = getRegionFocusFrame(svgFrame, bounds);
    const centeredRegionTransform = getCameraTransformForFocusFrame({
      focusFrame: regionFocusFrame,
      frame: svgFrame,
      sceneSize,
      minScale: AUTO_REGION_MIN_SCALE,
      maxScale: MAX_SCENE_SCALE,
      viewportArea: mapViewportArea,
    });

    if (currentLevel === "region") {
      return centeredRegionTransform;
    }

    if (focusedVectorNode) {
      const isWordFocus = focusedVectorNode.node.data.entityKind === "word";
      const shouldOffsetForLessonDrawer =
        isWordFocus && isLessonOpen && sceneSize.width >= DESKTOP_DRAWER_BREAKPOINT;
      const focusedPoint = toFramePoint(
        focusedVectorNode.x,
        focusedVectorNode.y,
        layout.viewport,
        svgFrame,
      );
      const viewportArea = shouldOffsetForLessonDrawer
        ? (() => {
            const lessonDrawerWidth = Math.min(
              LESSON_DRAWER_DESKTOP_WIDTH,
              Math.round(sceneSize.width * LESSON_DRAWER_MAX_VIEWPORT_RATIO),
            );
            const availableWidth = Math.max(
              mapViewportArea.width - lessonDrawerWidth,
              mapViewportArea.width * 0.42,
            );

            return {
              x: mapViewportArea.x,
              y: mapViewportArea.y,
              width: availableWidth,
              height: mapViewportArea.height,
            };
          })()
        : mapViewportArea;
      const desiredScale = centeredRegionTransform.scale * (
        isWordFocus ? AUTO_WORD_FOCUS_SCALE : AUTO_NODE_FOCUS_SCALE
      );
      const centeredMinScale = getMinimumScaleForCenteredPoint({
        frame: svgFrame,
        point: focusedPoint,
        viewportArea,
      });
      const targetScale = clamp(
        Math.max(desiredScale, centeredMinScale),
        isWordFocus ? 4.8 : 3.45,
        MAX_SCENE_SCALE,
      );

      if (shouldOffsetForLessonDrawer) {
        return getCameraTransformForPoint({
          point: focusedPoint,
          frame: svgFrame,
          sceneSize,
          scale: targetScale,
          viewportArea,
        });
      }

      return getCameraTransformForPoint({
        point: focusedPoint,
        frame: svgFrame,
        sceneSize,
        scale: targetScale,
        viewportArea,
      });
    }

    return centeredRegionTransform;
  }, [
    currentLevel,
    focusedVectorNode,
    isLessonOpen,
    mapViewportArea,
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
    selectedRegionIdRef.current = selectedRegionId;
    sceneInteractionLockedRef.current = sceneInteractionLocked;
  }, [autoTransform, currentLevel, mapFrame, sceneInteractionLocked, sceneSize, selectedRegionId, selectedRegionLayout]);

  useEffect(() => {
    if (!sceneInteractionLocked) {
      return;
    }

    pointersRef.current.clear();
    dragRef.current = null;
    pinchRef.current = null;

    if (sceneRef.current) {
      sceneRef.current.style.cursor = "default";
    }
  }, [sceneInteractionLocked]);

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

  useEffect(() => {
    if (!autoFocusKey || autoFocusKey === lastAutoFocusKeyRef.current) {
      return;
    }

    lastAutoFocusKeyRef.current = autoFocusKey;
    cancelTransformAnim();
    pointersRef.current.clear();
    dragRef.current = null;
    pinchRef.current = null;
    manualTransformRef.current = { scale: 1, x: 0, y: 0 };
    lastAutoTargetRef.current = null;
  }, [autoFocusKey, cancelTransformAnim]);

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

  const zoomAndPanAt = useCallback(
    (center: PointerPosition, factor: number, delta: PointerPosition) => {
      const auto = autoTransformRef.current;
      const current = manualTransformRef.current;
      const nextScale = clampManualScale(current.scale * factor);
      const currentFullScale = auto.scale * current.scale;
      const nextFullScale = auto.scale * nextScale;
      const fullX = auto.x + current.x;
      const fullY = auto.y + current.y;
      const nextFullX = center.x - ((center.x - fullX) / currentFullScale) * nextFullScale;
      const nextFullY = center.y - ((center.y - fullY) / currentFullScale) * nextFullScale;

      applyManualTransform({
        scale: nextScale,
        x: nextFullX - auto.x + delta.x,
        y: nextFullY - auto.y + delta.y,
      });
    },
    [applyManualTransform, clampManualScale],
  );

  // Native wheel handler — registered with { passive: false } so preventDefault works
  const handleWheelNative = useCallback(
    (event: WheelEvent) => {
      if (sceneInteractionLockedRef.current) {
        event.preventDefault();
        return;
      }

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
      if (sceneInteractionLockedRef.current) {
        return;
      }

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
      const sceneRect = sceneRef.current?.getBoundingClientRect();
      sceneGestureRectRef.current = sceneRect
        ? { left: sceneRect.left, top: sceneRect.top }
        : null;

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
      if (sceneInteractionLockedRef.current) {
        return;
      }

      if (isOverlayTarget(event.target)) {
        return;
      }

      if (!pointersRef.current.has(event.pointerId)) {
        return;
      }

      const position = { x: event.clientX, y: event.clientY };
      pointersRef.current.set(event.pointerId, position);

      const pointersIterator = pointersRef.current.values();
      const firstPointer = pointersIterator.next().value;
      const secondPointer = pointersIterator.next().value;

      if (firstPointer && secondPointer) {
        const distance = getDistance(firstPointer, secondPointer);
        const center = getMidpoint(firstPointer, secondPointer);
        const previous = pinchRef.current;

        if (previous && previous.distance > 0) {
          const rect = sceneGestureRectRef.current;
          dismissGraphHovers();
          zoomAndPanAt(
            rect ? { x: center.x - rect.left, y: center.y - rect.top } : center,
            clamp(distance / previous.distance, 0.82, 1.22),
            { x: center.x - previous.center.x, y: center.y - previous.center.y },
          );
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
    [applyManualTransform, dismissGraphHovers, zoomAndPanAt],
  );

  const handlePointerEnd = useCallback(
    (event: PointerEvent) => {
      if (sceneInteractionLockedRef.current) {
        return;
      }

      if (isOverlayTarget(event.target)) {
        pointersRef.current.delete(event.pointerId);

        if (sceneRef.current?.hasPointerCapture(event.pointerId)) {
          sceneRef.current.releasePointerCapture(event.pointerId);
        }

        if (pointersRef.current.size === 0) {
          dragRef.current = null;
          pinchRef.current = null;
          isNavigatingRef.current = false;
          sceneGestureRectRef.current = null;
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
        sceneGestureRectRef.current = null;
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
    <div data-help-surface="vocabulary-graph" className="absolute inset-0">
      <div
        ref={sceneRef}
        data-help-target="graph-canvas"
        className="map-scene vocabulary-map-surface absolute inset-0 z-0 cursor-grab overflow-hidden touch-none select-none kanji-bg-base"
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
            <div
              aria-hidden="true"
              className="vocabulary-board-background kanji-bg-base pointer-events-none absolute z-0"
              style={{
                left: "50%",
                top: "50%",
                width: "max(320vw, 320vh)",
                height: "max(320vw, 320vh)",
                transform: "translate(-50%, -50%)",
              }}
            >
            </div>

            <div
              data-help-target="vocabulary-map-view"
              className="vocabulary-map-frame absolute inset-0 pointer-events-none"
              style={mapFrameStyle}
            >
              <div className="vocabulary-map-safe-area absolute" style={mapSafeAreaStyle}>
                <div className="h-full w-full pointer-events-auto">
                <JapanRegionMap
                  regions={regions}
                  selectedRegionId={activeRegionId}
                  loadingRegionId={loadingRegionId}
                  layoutCountsByRegion={layoutCountsByRegion}
                  hoverResetToken={hoverResetToken}
                  cultureHoverEnabled={cultureExplorationEnabled}
                  interactionDisabled={currentLevel !== "map"}
                  onRegionSelect={handleMapRegionSelect}
                  onLayoutChange={handleRegionLayoutsChange}
                />
                </div>
              </div>
              <div className="vocabulary-map-coordinate-grid" aria-hidden="true">
                {JAPAN_LONGITUDE_COORDINATES.map((coordinate) => (
                  <div
                    key={`longitude-line-${coordinate.label}`}
                    className="vocabulary-map-coordinate-grid__line vocabulary-map-coordinate-grid__line--vertical"
                    style={{ left: coordinate.position }}
                  />
                ))}
                {JAPAN_LATITUDE_COORDINATES.map((coordinate) => (
                  <div
                    key={`latitude-line-${coordinate.label}`}
                    className="vocabulary-map-coordinate-grid__line vocabulary-map-coordinate-grid__line--horizontal"
                    style={{ top: coordinate.position }}
                  />
                ))}
              </div>
              <div className="vocabulary-map-coordinates vocabulary-map-coordinates--top">
                {JAPAN_LONGITUDE_COORDINATES.map((coordinate) => (
                  <span
                    key={`top-${coordinate.label}`}
                    style={{ left: coordinate.position }}
                  >
                    {coordinate.label}
                  </span>
                ))}
              </div>
              <div className="vocabulary-map-coordinates vocabulary-map-coordinates--bottom">
                {JAPAN_LONGITUDE_COORDINATES.map((coordinate) => (
                  <span
                    key={`bottom-${coordinate.label}`}
                    style={{ left: coordinate.position }}
                  >
                    {coordinate.label}
                  </span>
                ))}
              </div>
              <div className="vocabulary-map-coordinates vocabulary-map-coordinates--left">
                {JAPAN_LATITUDE_COORDINATES.map((coordinate) => (
                  <span
                    key={`left-${coordinate.label}`}
                    style={{ top: coordinate.position }}
                  >
                    {coordinate.label}
                  </span>
                ))}
              </div>
              <div className="vocabulary-map-coordinates vocabulary-map-coordinates--right">
                {JAPAN_LATITUDE_COORDINATES.map((coordinate) => (
                  <span
                    key={`right-${coordinate.label}`}
                    style={{ top: coordinate.position }}
                  >
                    {coordinate.label}
                  </span>
                ))}
              </div>
            </div>

            {selectedRegion && currentLevel === "region" ? (
              !graphTransitionLoading && regionThemeLayoutReady ? (
                <div
                  data-help-target="vocabulary-region-graph"
                  className="vocabulary-map-safe-area absolute pointer-events-none"
                  style={mapSafeAreaStyle}
                >
                  <div className="h-full w-full pointer-events-auto">
                    <RegionThemeGraph
                      region={selectedRegion}
                      regionBounds={selectedRegionLayout?.bounds ?? null}
                      nodePoints={selectedRegionLayout?.nodePoints ?? null}
                      viewport={selectedRegionLayout?.viewport ?? null}
                      shakingThemeId={shakingThemeId}
                      helpTargetThemeId={helpTheme?.id ?? null}
                      interactionDisabled={graphInteractionDisabled}
                      onThemeSelect={handleThemeSelected}
                    />
                  </div>
                </div>
              ) : null
            ) : null}

            {selectedRegion &&
            regionGraph &&
            !graphTransitionLoading &&
            vectorGraphLayoutReady &&
            (currentLevel === "theme" || currentLevel === "subtheme") ? (
              <div
                data-help-target="vocabulary-subtheme-graph"
                className="vocabulary-map-safe-area absolute pointer-events-none"
                style={mapSafeAreaStyle}
              >
                <div className="h-full w-full pointer-events-auto">
                  <RegionVectorGraph
                    nodes={regionGraph.nodes}
                    edges={regionGraph.edges as GraphEdge[]}
                    regionBounds={selectedRegionLayout?.bounds ?? null}
                    nodePoints={selectedRegionLayout?.nodePoints ?? null}
                    viewport={selectedRegionLayout?.viewport ?? null}
                    level={currentLevel}
                    interactionDisabled={graphInteractionDisabled}
                    hoverResetToken={hoverResetToken}
                    unlockTransition={unlockTransition}
                    onNodeSelected={regionGraph.onNodeSelected}
                  />
                </div>
              </div>
            ) : null}
          </motion.div>
          <PointsRewardFloat
            points={mapRewardFloatPoints}
            caption="Progreso de vocabulario"
            onComplete={() => setMapRewardFloatPoints(null)}
          />
          {!isLessonOpen ? (
            <ContextualHelpButton
              getTour={buildHelpTour}
              actions={[
                {
                  id: "culture-exploration-mode",
                  label: cultureExplorationEnabled
                    ? "Desactivar modo exploración de cultura"
                    : "Entrar a modo exploración de cultura",
                  description:
                    cultureExplorationEnabled
                      ? "Oculta los hover culturales del mapa y vuelve al comportamiento normal de vocabulario."
                      : "Activa los hover culturales por región y te devuelve al mapa para recorrer Japón con pistas culturales en pantalla.",
                  icon: Compass,
                  tone: "danger",
                  onClick: cultureExplorationEnabled
                    ? disableCultureExplorationMode
                    : enterCultureExplorationMode,
                },
              ]}
            />
          ) : null}
          <VocabularyNodePanel
            item={selectedSubthemeItem}
            question={selectedWord}
            onClose={() => {
              setSelectedWordId(null);
              setUnlockFocusWordId(null);
            }}
            onNavigateToLibrary={handleNavigateToLibrary}
            onSaved={handleVocabularyQuizSaved}
          />
          <GraphGateModal
            open={showMissingInterestsModal}
            variant="missing-interests"
            onClose={() => setShowMissingInterestsModal(false)}
            onSaveInterests={handleMissingInterestsSaved}
          />
          <GraphGateModal
            open={showVocabularyAccessModal}
            variant="kana-required"
            blockedContentLabel="vocabulario"
            onClose={() => setShowVocabularyAccessModal(false)}
            onOpenHiragana={() => {
              setShowVocabularyAccessModal(false);
              router.push("/dashboard/graph/writing?tab=hiragana");
            }}
            onOpenKatakana={() => {
              setShowVocabularyAccessModal(false);
              router.push("/dashboard/graph/writing?tab=katakana");
            }}
          />
          <PremiumThemeGateModal
            open={showPremiumThemeModal}
            blockedThemeLabel={premiumThemeLabel}
            onClose={() => setShowPremiumThemeModal(false)}
            onOpenUpgrade={() => {
              setShowPremiumThemeModal(false);
              router.push("/checkout?returnTo=%2Fdashboard%2Fgraph");
            }}
            onOpenPlans={() => {
              setShowPremiumThemeModal(false);
              router.push("/auth/membership?from=dashboard&returnTo=%2Fdashboard%2Fgraph");
            }}
          />
          </>
        )}
      </div>
    </div>
  );
}
