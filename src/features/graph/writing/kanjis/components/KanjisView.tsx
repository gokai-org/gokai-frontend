"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { useSidebar } from "@/shared/components/SidebarContext";
import { KanjiQuizModal } from "@/features/kanji/components/quiz";
import type { KanjiQuizType } from "@/features/kanji/types/quiz";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import type { Viewport } from "reactflow";
import {
  formatBackgroundViewportState,
  normalizeViewportForBackground,
  type BackgroundViewportCssState,
  type BackgroundViewportState,
} from "../../shared/lib/backgroundViewport";
import {
  buildKanjiBoardLayout,
  buildTranslateExtent,
  createBaseKanjiBoardGraph,
  applyBoardUIState,
} from "../lib/boardBuilder";
import type { KanjiBoardQualitySignals } from "../types";
import { useKanjiBoard } from "../hooks/useKanjiBoard";
import { useKanjiBoardQuality } from "../hooks/useKanjiBoardQuality";
import { KanjiBoardBackground } from "./KanjiBoardBackground";
import { KanjiBoardMap } from "./KanjiBoardMap";
import WritingBoardLoading from "../../shared/components/WritingBoardLoading";
import { MasteryBoardWrapper } from "@/features/mastery/components/MasteryBoardWrapper";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { MASTERY_THRESHOLDS } from "@/features/mastery/constants/masteryConfig";
import { dispatchMasteryCelebrationRequest, dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { ContextualHelpButton } from "@/features/help/components/ContextualHelpButton";
import {
  createLockedBoardAccessTour,
  createWritingBoardContextTour,
} from "@/features/help/utils/contextualTours";

type KanjiQuizCompletionResult = {
  newlyCompleted: boolean;
  newlyCompletedPoints: number;
  dominated: boolean;
  score: number;
  triggeredModuleMastery: boolean;
};

const GRAPH_USER_ID = "user123";

function isKanjiQuizType(
  quizType?: KanaQuizType | KanjiQuizType,
): quizType is KanjiQuizType {
  return (
    quizType === undefined ||
    quizType === "kanji" ||
    quizType === "meaning" ||
    quizType === "reading" ||
    quizType === "writing"
  );
}

export default function KanjisView() {
  const { items, summary, reload, loading, userPoints } = useKanjiBoard();
  const { graphicsProfile } = usePlatformMotion();
  const qualityProfile = useKanjiBoardQuality(graphicsProfile);
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();
  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [helpSelectedNodeId, setHelpSelectedNodeId] = useState<string | null>(null);
  const [quizKanji, setQuizKanji] = useState<{
    id: string;
    symbol: string;
    quizType?: KanjiQuizType;
    wasCompletedBefore: boolean;
    isPracticeOnly: boolean;
  } | null>(null);
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [suppressedUnlockPointIds, setSuppressedUnlockPointIds] = useState<ReadonlySet<string>>(
    new Set(),
  );
  const [unlockFocusNodeId, setUnlockFocusNodeId] = useState<string | null>(
    null,
  );
  const [shakingNodeId, setShakingNodeId] = useState<string | null>(null);
  const lockedIdsBeforeQuizRef = useRef<Set<string> | null>(null);
  const shouldResolveUnlocksRef = useRef(false);
  const shakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const unlockFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const wasMasteredBeforeQuizRef = useRef(false);
  const pendingMasteryCelebrationRef = useRef(false);
  const celebrationFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pause parallax rAF loop while the quiz modal is on top.
  const quizActiveRef = useRef(false);
  // Always-current item/reload refs so event callbacks stay stable.
  const itemsRef = useRef(items);
  const reloadRef = useRef(reload);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => {
    reloadRef.current = reload;
  }, [reload]);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportFrame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const qualityProfileRef = useRef(qualityProfile);
  // Tracks shouldUseParallax without capturing it in callback closures.
  const shouldUseParallaxRef = useRef(graphicsProfile.shouldUseParallax);
  const isInteractingRef = useRef(false);
  const animateBackgroundViewportRef = useRef<(timestamp: number) => void>(
    () => undefined,
  );
  const latestViewport = useRef<Viewport>({ x: 0, y: 0, zoom: 1 });
  const appliedViewportCss = useRef<BackgroundViewportCssState>({
    x: "0px",
    y: "0px",
    zoom: "1.0000",
  });
  const appliedViewport = useRef<BackgroundViewportState>({
    x: 0,
    y: 0,
    zoom: 1,
  });

  // Mastery: capture setCenter from the inner ReactFlow.
  type SetCenterFn = (x: number, y: number, options: { zoom: number; duration: number }) => void;
  const setCenterRef = useRef<SetCenterFn | null>(null);
  const handleSetCenterReady = useCallback((fn: SetCenterFn) => {
    setCenterRef.current = fn;
  }, []);
  const stableSetCenter = useCallback<SetCenterFn>(
    (x, y, opts) => setCenterRef.current?.(x, y, opts),
    [],
  );

  const selectedId = useMemo(() => {
    if (detailNodeId && items.some((item) => item.id === detailNodeId)) {
      return detailNodeId;
    }

    if (
      helpSelectedNodeId &&
      items.some((item) => item.id === helpSelectedNodeId)
    ) {
      return helpSelectedNodeId;
    }

    if (
      manualSelectedId &&
      items.some((item) => item.id === manualSelectedId)
    ) {
      return manualSelectedId;
    }

    return (
      [...items].reverse().find((item) => item.status !== "locked")?.id ??
      summary.currentKanjiId ??
      items[0]?.id ??
      null
    );
  }, [detailNodeId, helpSelectedNodeId, items, manualSelectedId, summary.currentKanjiId]);

  const layoutIds = useMemo(() => items.map((item) => item.id), [items]);
  const layout = useMemo(() => buildKanjiBoardLayout(layoutIds), [layoutIds]);

  const translateExtent = useMemo(
    () =>
      buildTranslateExtent(
        layout.nodeBounds,
        graphicsProfile.signals.width,
        graphicsProfile.signals.height,
      ),
    [
      layout.nodeBounds,
      graphicsProfile.signals.width,
      graphicsProfile.signals.height,
    ],
  );

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === detailNodeId) ?? null,
    [detailNodeId, items],
  );

  const helpNodeId = useMemo(
    () => items.find((item) => item.status !== "locked")?.id ?? null,
    [items],
  );

  const focusedNodeId = detailNodeId ?? helpSelectedNodeId ?? unlockFocusNodeId;

  // Phase 1 — structural graph: stable across interactions; rebuilds only when
  // items, layout, or quality params change.  Does NOT hold selection/shaking/
  // unlocking state, so clicking a node does NOT trigger a full graph rebuild.

  const baseGraph = useMemo(
    () => createBaseKanjiBoardGraph(items, layout, qualityProfile),
    [items, layout, qualityProfile],
  );

  // Phase 2 — UI state patch: fast O(n) pass; only changed nodes/edges get new
  // object refs so ReactFlow’s internal memo comparator skips untouched nodes.
  const drawerOpen = detailNodeId !== null;
  const graph = useMemo(
    () =>
      applyBoardUIState(
        baseGraph,
        selectedId,
        newlyUnlockedIds,
        suppressedUnlockPointIds,
        shakingNodeId,
        drawerOpen,
      ),
    [
      baseGraph,
      selectedId,
      newlyUnlockedIds,
      suppressedUnlockPointIds,
      shakingNodeId,
      drawerOpen,
    ],
  );

  const backgroundStyle = useMemo(() => {
    const { width, height, pointerType } = graphicsProfile.signals;
    const compact = width <= 1180 || pointerType === "coarse";
    const diagonal = Math.hypot(width, height);
    // Single span for the one parallax star layer
    const span = Math.round(
      Math.max(diagonal * (compact ? 2.6 : 2.2), compact ? 2800 : 2200),
    );
    const parallaxAtten = compact ? 0.8 : 1;
    const zoomAtten = compact ? 0.55 : 1;

    return {
      "--kanji-camera-x": "0px",
      "--kanji-camera-y": "0px",
      "--kanji-camera-zoom": 1,
      "--kanji-layer-span": `${span}px`,
      "--kanji-parallax-factor": graphicsProfile.shouldUseParallax
        ? `${(-0.22 * qualityProfile.background.parallaxStrength * parallaxAtten).toFixed(4)}`
        : "0",
      "--kanji-parallax-zoom-factor": graphicsProfile.shouldUseParallax
        ? `${(0.052 * qualityProfile.background.zoomStrength * zoomAtten).toFixed(4)}`
        : "0",
    } as React.CSSProperties;
  }, [
    graphicsProfile.shouldUseParallax,
    graphicsProfile.signals,
    qualityProfile.background.parallaxStrength,
    qualityProfile.background.zoomStrength,
  ]);

  const handleSelect = useCallback((nodeId: string) => {
    const item = itemsRef.current.find((i) => i.id === nodeId);
    if (item?.status === "locked") {
      // Locked node: quick shake feedback without opening drawer
      if (shakingTimerRef.current) clearTimeout(shakingTimerRef.current);
      setShakingNodeId(nodeId);
      shakingTimerRef.current = setTimeout(() => setShakingNodeId(null), 640);
      return;
    }
    setManualSelectedId(nodeId);
    setDetailNodeId(nodeId);
  }, []); // stable — reads itemsRef at call time

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const focusHelpNode = useCallback(() => {
    if (!helpNodeId) {
      return;
    }

    setDetailNodeId(null);
    setHelpSelectedNodeId(helpNodeId);
  }, [helpNodeId]);

  const openHelpLesson = useCallback(() => {
    if (!helpNodeId) {
      return;
    }

    setHelpSelectedNodeId(null);
    setManualSelectedId(helpNodeId);
    setDetailNodeId(helpNodeId);
  }, [helpNodeId]);

  const resetHelpTourState = useCallback(() => {
    setHelpSelectedNodeId(null);
    setDetailNodeId(null);
  }, []);

  const buildHelpTour = useCallback(
    () => {
      if (!helpNodeId) {
        return createLockedBoardAccessTour({
          id: "kanji-context-tour-locked",
          title: "Guia de Kanji",
          scopeSelector: '[data-help-surface="kanji-board"]',
          boardLabel: "Tablero de kanji",
          requirementLabel: "puntos suficientes",
        });
      }

      return createWritingBoardContextTour({
        id: "kanji-context-tour",
        title: "Guia de Kanji",
        scopeSelector: '[data-help-surface="kanji-board"]',
        scriptLabel: "kanji",
        unitLabel: "kanji",
        lessonSummary: "simbolo, lecturas, significados y escritura",
        focusNode: focusHelpNode,
        openLesson: openHelpLesson,
        resetTourState: resetHelpTourState,
        includeScriptTabs:
          typeof document !== "undefined" &&
          document.querySelector('[data-help-target="writing-script-tabs"]') !== null,
      });
    },
    [focusHelpNode, helpNodeId, openHelpLesson, resetHelpTourState],
  );

  const handleQuizStart = useCallback(
    (
      kanji: { id: string; symbol: string },
      quizType?: KanaQuizType | KanjiQuizType,
    ) => {
      if (!isKanjiQuizType(quizType)) {
        return;
      }

      // Close detail drawer before opening quiz overlay.
      setDetailNodeId(null);
      // Freeze parallax & board animations while the quiz overlay is active.
      quizActiveRef.current = true;
      lockedIdsBeforeQuizRef.current = new Set(
        itemsRef.current
          .filter((item) => item.status === "locked")
          .map((item) => item.id),
      );
      shouldResolveUnlocksRef.current = false;
      if (backgroundRef.current)
        backgroundRef.current.dataset.kanjiQuizActive = "true";
      if (rootRef.current) rootRef.current.dataset.kanjiQuizActive = "true";
      wasMasteredBeforeQuizRef.current = mastered.has("kanji");
      const wasCompletedBefore =
        itemsRef.current.find((item) => item.id === kanji.id)?.status === "completed";
      setQuizKanji({
        ...kanji,
        quizType,
        wasCompletedBefore,
        isPracticeOnly: quizType !== undefined,
      });
    },
    [mastered],
  );

  const handleQuizEnd = useCallback((result?: KanjiQuizCompletionResult) => {
    const isPracticeOnly = quizKanji?.isPracticeOnly === true;
    const resultingPoints = userPoints + (result?.newlyCompletedPoints ?? 0);
    const becameMastered =
      !wasMasteredBeforeQuizRef.current &&
      resultingPoints >= MASTERY_THRESHOLDS.kanji;

    setQuizKanji(null);
    quizActiveRef.current = false;
    if (backgroundRef.current)
      backgroundRef.current.dataset.kanjiQuizActive = "false";
    if (rootRef.current) rootRef.current.dataset.kanjiQuizActive = "false";
    if (isPracticeOnly) {
      pendingMasteryCelebrationRef.current = false;
      shouldResolveUnlocksRef.current = false;
      lockedIdsBeforeQuizRef.current = null;
      setSuppressedUnlockPointIds(new Set());
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
        celebrationFallbackTimerRef.current = null;
      }
      return;
    }
    if (result?.newlyCompleted && result.newlyCompletedPoints > 0) {
      dispatchMasteryProgressSync({
        points: userPoints + result.newlyCompletedPoints,
      });
    }
    if (result?.triggeredModuleMastery) {
      pendingMasteryCelebrationRef.current = false;
      setSuppressedUnlockPointIds(new Set());
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
        celebrationFallbackTimerRef.current = null;
      }
      window.requestAnimationFrame(() => {
        dispatchMasteryCelebrationRequest({ moduleId: "kanji" });
      });
      shouldResolveUnlocksRef.current = lockedIdsBeforeQuizRef.current !== null;
      void reloadRef.current();
      return;
    }
    if (becameMastered) {
      pendingMasteryCelebrationRef.current = true;
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
      }
      celebrationFallbackTimerRef.current = setTimeout(() => {
        if (!pendingMasteryCelebrationRef.current) return;
        pendingMasteryCelebrationRef.current = false;
        setSuppressedUnlockPointIds(new Set());
        dispatchMasteryCelebrationRequest({ moduleId: "kanji" });
      }, 2900);
    }
    shouldResolveUnlocksRef.current = lockedIdsBeforeQuizRef.current !== null;
    void reloadRef.current();
  }, [quizKanji, userPoints]);

  useEffect(() => {
    if (!shouldResolveUnlocksRef.current) return;

    shouldResolveUnlocksRef.current = false;
    const lockedIdsBeforeQuiz = lockedIdsBeforeQuizRef.current;
    lockedIdsBeforeQuizRef.current = null;

    if (!lockedIdsBeforeQuiz) return;

    const unlockedIds = items
      .filter(
        (item) => lockedIdsBeforeQuiz.has(item.id) && item.status !== "locked",
      )
      .map((item) => item.id);

    if (unlockedIds.length === 0) return;

    if (unlockAnimationTimerRef.current !== null) {
      clearTimeout(unlockAnimationTimerRef.current);
    }
    if (unlockFocusTimerRef.current !== null) {
      clearTimeout(unlockFocusTimerRef.current);
    }

    const firstUnlockedId = unlockedIds[0];
    const nextUnlockedIds = new Set(unlockedIds);
    const nextSuppressedUnlockPointIds = pendingMasteryCelebrationRef.current
      ? new Set(unlockedIds)
      : new Set<string>();

    const raf = requestAnimationFrame(() => {
      setDetailNodeId(null);
      setManualSelectedId(firstUnlockedId);
      setUnlockFocusNodeId(firstUnlockedId);
      setNewlyUnlockedIds(nextUnlockedIds);
      setSuppressedUnlockPointIds(nextSuppressedUnlockPointIds);
    });

    unlockAnimationTimerRef.current = setTimeout(() => {
      setNewlyUnlockedIds(new Set());
      setSuppressedUnlockPointIds(new Set());
      if (pendingMasteryCelebrationRef.current) {
        pendingMasteryCelebrationRef.current = false;
        if (celebrationFallbackTimerRef.current !== null) {
          clearTimeout(celebrationFallbackTimerRef.current);
          celebrationFallbackTimerRef.current = null;
        }
        dispatchMasteryCelebrationRequest({ moduleId: "kanji" });
      }
    }, 2500);
    unlockFocusTimerRef.current = setTimeout(() => {
      setUnlockFocusNodeId(null);
    }, 2500);

    return () => cancelAnimationFrame(raf);
  }, [items]);

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  const setInteractionState = useCallback((isInteracting: boolean) => {
    isInteractingRef.current = isInteracting;
    const val = isInteracting ? "true" : "false";

    if (backgroundRef.current)
      backgroundRef.current.dataset.kanjiInteracting = val;
    // Root attr is the one that actually gates CSS animation-play-state for
    // React Flow nodes/edges (siblings to backgroundRef, descendants of rootRef).
    if (rootRef.current) rootRef.current.dataset.kanjiInteracting = val;
  }, []);

  useEffect(() => {
    qualityProfileRef.current = qualityProfile;
    shouldUseParallaxRef.current = qualityProfile.graphics.shouldUseParallax;
  }, [qualityProfile]);

  const applyBackgroundViewport = useCallback(
    (
      layer: HTMLDivElement,
      state: BackgroundViewportState,
      signals: KanjiBoardQualitySignals,
    ) => {
      const formattedState = formatBackgroundViewportState(state, signals);
      const previousState = appliedViewportCss.current;

      if (formattedState.x !== previousState.x) {
        layer.style.setProperty("--kanji-camera-x", formattedState.x);
      }

      if (formattedState.y !== previousState.y) {
        layer.style.setProperty("--kanji-camera-y", formattedState.y);
      }

      if (formattedState.zoom !== previousState.zoom) {
        layer.style.setProperty("--kanji-camera-zoom", formattedState.zoom);
      }

      appliedViewportCss.current = formattedState;
    },
    [],
  );

  // Pause parallax rAF while the lesson drawer is open
  const drawerOpenRef = useRef(drawerOpen);
  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
    if (drawerOpen && viewportFrame.current !== null) {
      window.cancelAnimationFrame(viewportFrame.current);
      viewportFrame.current = null;
    }
  }, [drawerOpen]);

  useEffect(() => {
    animateBackgroundViewportRef.current = (timestamp: number) => {
      viewportFrame.current = null;

      // While the quiz overlay is on top, don’t touch CSS vars — the browser
      // doesn’t need to re-composite the parallax layer behind the modal.
      if (quizActiveRef.current) return;

      // Pause parallax while the lesson drawer is open
      if (drawerOpenRef.current) return;

      const layer = backgroundRef.current;
      if (!layer) return;

      const profile = qualityProfileRef.current;
      const signals = profile.graphics.signals;

      if (!profile.graphics.shouldUseParallax) {
        const restingState = {
          x: 0,
          y: 0,
          zoom: 1,
        };

        appliedViewport.current = restingState;
        applyBackgroundViewport(layer, restingState, signals);
        lastFrameTime.current = null;
        return;
      }

      const previousTime = lastFrameTime.current ?? timestamp;
      const delta = Math.min(32, Math.max(8, timestamp - previousTime));
      lastFrameTime.current = timestamp;

      const target = latestViewport.current;
      const previous = appliedViewport.current;
      const smoothing = profile.allowMotion
        ? 1 -
          Math.exp(
            -delta /
              (isInteractingRef.current
                ? profile.background.interactionSmoothingMs
                : profile.background.idleSmoothingMs),
          )
        : 1;

      const next = {
        x: previous.x + (target.x - previous.x) * smoothing,
        y: previous.y + (target.y - previous.y) * smoothing,
        zoom: previous.zoom + (target.zoom - previous.zoom) * smoothing,
      };

      if (Math.abs(target.x - next.x) < profile.background.epsilonPosition)
        next.x = target.x;
      if (Math.abs(target.y - next.y) < profile.background.epsilonPosition)
        next.y = target.y;
      if (Math.abs(target.zoom - next.zoom) < profile.background.epsilonZoom)
        next.zoom = target.zoom;

      const hasMeaningfulChange =
        Math.abs(previous.x - next.x) >=
          profile.background.epsilonPosition * 0.5 ||
        Math.abs(previous.y - next.y) >=
          profile.background.epsilonPosition * 0.5 ||
        Math.abs(previous.zoom - next.zoom) >=
          profile.background.epsilonZoom * 0.5;

      if (hasMeaningfulChange) {
        appliedViewport.current = next;
        applyBackgroundViewport(layer, next, signals);
      }

      const isSettled =
        Math.abs(target.x - next.x) < profile.background.epsilonPosition &&
        Math.abs(target.y - next.y) < profile.background.epsilonPosition &&
        Math.abs(target.zoom - next.zoom) < profile.background.epsilonZoom;

      if (!isSettled || isInteractingRef.current) {
        viewportFrame.current = window.requestAnimationFrame(
          animateBackgroundViewportRef.current,
        );
        return;
      }

      appliedViewport.current = {
        x: target.x,
        y: target.y,
        zoom: target.zoom,
      };
      applyBackgroundViewport(layer, appliedViewport.current, signals);
      lastFrameTime.current = null;
    };
  }, [applyBackgroundViewport]);

  const ensureViewportAnimation = useCallback(() => {
    if (viewportFrame.current !== null) return;

    viewportFrame.current = window.requestAnimationFrame(
      animateBackgroundViewportRef.current,
    );
  }, []);

  const syncViewportToScene = useCallback(
    (viewport: Viewport) => {
      latestViewport.current = normalizeViewportForBackground(
        viewport,
        qualityProfileRef.current.graphics.signals,
      );

      if (!shouldUseParallaxRef.current) return;

      ensureViewportAnimation();
    },
    [ensureViewportAnimation],
  );

  const handleInteractionChange = useCallback(
    (isInteracting: boolean) => {
      setInteractionState(isInteracting);

      if (!shouldUseParallaxRef.current) return;

      ensureViewportAnimation();
    },
    [ensureViewportAnimation, setInteractionState],
  );

  useEffect(() => {
    return () => {
      if (viewportFrame.current !== null) {
        window.cancelAnimationFrame(viewportFrame.current);
      }
      if (shakingTimerRef.current !== null) {
        clearTimeout(shakingTimerRef.current);
      }
      if (unlockAnimationTimerRef.current !== null) {
        clearTimeout(unlockAnimationTimerRef.current);
      }
      if (unlockFocusTimerRef.current !== null) {
        clearTimeout(unlockFocusTimerRef.current);
      }
      if (celebrationFallbackTimerRef.current !== null) {
        clearTimeout(celebrationFallbackTimerRef.current);
      }
      lastFrameTime.current = null;
    };
  }, []);

  if (loading) {
    return <WritingBoardLoading scriptType="kanji" />;
  }

  return (
    <MasteryBoardWrapper
      moduleId="kanji"
      currentPoints={userPoints}
      autoTriggerOnNewMastery={false}
      totalItems={items.length}
      completedItems={summary.completedCount}
      nodes={graph.nodes}
      setCenter={stableSetCenter}
      tourZoom={qualityProfile.camera.focusZoom}
    >
      <div
        ref={rootRef}
        data-help-surface="kanji-board"
        data-kanji-interacting="false"
        data-kanji-quiz-active="false"
        data-drawer-open={drawerOpen ? "true" : "false"}
        className="absolute inset-0 overflow-hidden bg-surface-primary"
      >
        <div
        ref={backgroundRef}
        data-kanji-interacting="false"
        data-kanji-quality={qualityProfile.tier}
        data-kanji-parallax={
          graphicsProfile.shouldUseParallax ? "active" : "inactive"
        }
        data-kanji-quiz-active="false"
        className="absolute inset-0"
        style={
          {
            contain: "layout paint style",
            ...backgroundStyle,
          } as React.CSSProperties
        }
      >
        <KanjiBoardBackground
          qualityProfile={qualityProfile}
          graphicsProfile={graphicsProfile}
        />
        </div>

        <div data-help-target="board-canvas" className="absolute inset-0 z-10">
          <KanjiBoardMap
            nodes={graph.nodes}
            edges={graph.edges}
            layout={layout}
            onSelect={handleSelect}
            onViewportChange={syncViewportToScene}
            initialNodeId={selectedId}
            focusedNodeId={focusedNodeId}
            drawerOpen={drawerOpen}
            onInteractionChange={handleInteractionChange}
            qualityProfile={qualityProfile}
            translateExtent={translateExtent}
            onSetCenterReady={handleSetCenterReady}
          />
        </div>

        <LessonDrawer
          open={detailNodeId !== null}
          onClose={handleCloseDetail}
          nodeId={detailNodeId}
          mode="writing"
          userId={GRAPH_USER_ID}
          entityId={selectedProgress?.kanji.id ?? null}
          entityKind={selectedProgress ? "kanji" : null}
          kanjiCtaDisabled={selectedProgress?.status === "locked"}
          kanjiCtaDisabledReason={
            selectedProgress?.status === "locked"
              ? `Consigue ${selectedProgress.completionScore}% en el kanji anterior para desbloquear la práctica.`
              : undefined
          }
          onQuizStart={handleQuizStart}
        />

        {detailNodeId === null && <ContextualHelpButton getTour={buildHelpTour} />}

        {quizKanji !== null && (
          <KanjiQuizModal
            kanjiId={quizKanji.id}
            label={quizKanji.symbol}
            quizType={quizKanji.quizType}
            currentModulePoints={userPoints}
            wasCompletedBefore={quizKanji.wasCompletedBefore}
            onClose={handleQuizEnd}
          />
        )}
      </div>
    </MasteryBoardWrapper>
  );
}
