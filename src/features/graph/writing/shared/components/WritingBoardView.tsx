"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeMouseHandler,
  type Viewport,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useSidebar } from "@/shared/components/SidebarContext";
import { usePlatformMotion } from "@/shared/hooks/usePlatformMotion";
import {
  buildWritingBoardLayout,
  buildTranslateExtent,
  createBaseWritingBoardGraph,
  applyWritingBoardUIState,
  type WritingBoardLayout,
} from "../lib/boardBuilder";
import { useWritingBoardQuality } from "../hooks/useWritingBoardQuality";
import type {
  WritingBoardNode,
  WritingBoardEdge,
  WritingBoardQualityProfile,
  WritingBoardQualitySignals,
  WritingBoardProgress,
  WritingBoardSummary,
  WritingScriptType,
} from "../types";
import { WritingBoardBackground } from "./WritingBoardBackground";
import WritingBoardLoading from "./WritingBoardLoading";
import type { MasteryModuleId } from "@/features/mastery/types";
import { MasteryBoardWrapper } from "@/features/mastery/components/MasteryBoardWrapper";

type BackgroundViewportState = {
  x: number;
  y: number;
  zoom: number;
};

type BackgroundViewportCssState = {
  x: string;
  y: string;
  zoom: string;
};

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function snap(v: number, step: number) {
  return step <= 0 ? v : Math.round(v / step) * step;
}

function getBackgroundViewportConfig(signals: WritingBoardQualitySignals) {
  const compact = signals.width <= 1180 || signals.pointerType === "coarse";
  const positionStep = compact || signals.devicePixelRatio >= 2 ? 0.5 : 1;

  return {
    compact,
    positionStep,
    zoomStep: compact ? 0.0015 : 0.001,
    xLimit: Math.max(
      signals.width * (compact ? 2.8 : 2.25),
      compact ? 1400 : 980,
    ),
    yLimit: Math.max(
      signals.height * (compact ? 1.95 : 1.6),
      compact ? 960 : 720,
    ),
  };
}

function normalizeViewportForBackground(
  viewport: Viewport,
  signals: WritingBoardQualitySignals,
) {
  const cfg = getBackgroundViewportConfig(signals);

  return {
    x: snap(clamp(viewport.x, -cfg.xLimit, cfg.xLimit), cfg.positionStep),
    y: snap(clamp(viewport.y, -cfg.yLimit, cfg.yLimit), cfg.positionStep),
    zoom: snap(viewport.zoom, cfg.zoomStep),
  };
}

function formatBgViewport(
  state: BackgroundViewportState,
  signals: WritingBoardQualitySignals,
): BackgroundViewportCssState {
  const cfg = getBackgroundViewportConfig(signals);
  const x = snap(state.x, cfg.positionStep);
  const y = snap(state.y, cfg.positionStep);
  const zoom = snap(state.zoom, cfg.zoomStep);

  return {
    x: `${x.toFixed(cfg.positionStep < 1 ? 1 : 0)}px`,
    y: `${y.toFixed(cfg.positionStep < 1 ? 1 : 0)}px`,
    zoom: zoom.toFixed(4),
  };
}

const PLANET_CENTER_X = 84;
const PLANET_CENTER_Y = 78;

function getPlanetFocusPoint(node: WritingBoardNode) {
  const width =
    typeof node.style?.width === "number"
      ? node.style.width
      : PLANET_CENTER_X * 2;

  return {
    x: node.position.x + width / 2,
    y: node.position.y + PLANET_CENTER_Y,
  };
}

function getLastUnlockedNodeId(items: WritingBoardProgress[]) {
  return (
    [...items].reverse().find((item) => item.status !== "locked")?.id ?? null
  );
}

type SetCenterFn = (x: number, y: number, options: { zoom: number; duration: number }) => void;

interface InnerMapProps {
  nodes: WritingBoardNode[];
  edges: WritingBoardEdge[];
  layout: WritingBoardLayout;
  onSelect: (nodeId: string) => void;
  onViewportChange: (viewport: Viewport) => void;
  initialNodeId: string | null;
  focusedNodeId: string | null;
  onInteractionChange: (isInteracting: boolean) => void;
  qualityProfile: WritingBoardQualityProfile;
  translateExtent?: [[number, number], [number, number]];
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  onSetCenterReady?: (fn: SetCenterFn) => void;
}

function WritingBoardMapInner({
  nodes,
  edges,
  layout,
  onSelect,
  onViewportChange,
  initialNodeId,
  focusedNodeId,
  onInteractionChange,
  qualityProfile,
  translateExtent: translateExtentProp,
  nodeTypes,
  edgeTypes,
  onSetCenterReady,
}: InnerMapProps) {
  const { setCenter, getViewport, setViewport } = useReactFlow();

  // Expose setCenter to parent for mastery camera tour.
  useEffect(() => {
    onSetCenterReady?.(setCenter as SetCenterFn);
  }, [onSetCenterReady, setCenter]);
  const [stableNodeTypes] = useState(() => nodeTypes);
  const [stableEdgeTypes] = useState(() => edgeTypes);
  const hasInitializedViewport = useRef(false);
  const savedViewport = useRef<Viewport | null>(null);
  const lastFocusedNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (nodes.length === 0 || hasInitializedViewport.current) return;

    const frame = window.requestAnimationFrame(() => {
      hasInitializedViewport.current = true;

      const initialNode =
        (initialNodeId
          ? nodes.find((node) => node.id === initialNodeId)
          : null) ?? nodes[0];

      if (!initialNode) return;

      const fp = getPlanetFocusPoint(initialNode);

      void setCenter(fp.x, fp.y, {
        zoom: qualityProfile.camera.focusZoom,
        duration: qualityProfile.camera.initialDuration,
      });

      window.requestAnimationFrame(() => onViewportChange(getViewport()));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    getViewport,
    initialNodeId,
    nodes,
    onViewportChange,
    qualityProfile.camera.focusZoom,
    qualityProfile.camera.initialDuration,
    setCenter,
  ]);

  useEffect(() => {
    if (!hasInitializedViewport.current) return;

    if (focusedNodeId) {
      const focusedNode = nodes.find((node) => node.id === focusedNodeId);
      if (!focusedNode) return;

      if (lastFocusedNodeId.current !== focusedNodeId) {
        savedViewport.current = getViewport();
        lastFocusedNodeId.current = focusedNodeId;
      }

      const focusPoint = getPlanetFocusPoint(focusedNode);

      void setCenter(focusPoint.x, focusPoint.y, {
        zoom: qualityProfile.camera.focusZoom,
        duration: qualityProfile.camera.focusDuration,
      });

      const frame = window.requestAnimationFrame(() => {
        onViewportChange(getViewport());
      });

      return () => window.cancelAnimationFrame(frame);
    }

    if (!lastFocusedNodeId.current || !savedViewport.current) return;

    const previousViewport = savedViewport.current;
    savedViewport.current = null;
    lastFocusedNodeId.current = null;

    void setViewport(previousViewport, {
      duration: qualityProfile.camera.restoreDuration,
    });

    const frame = window.requestAnimationFrame(() => {
      onViewportChange(getViewport());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    focusedNodeId,
    getViewport,
    nodes,
    onViewportChange,
    qualityProfile.camera.focusZoom,
    qualityProfile.camera.focusDuration,
    qualityProfile.camera.restoreDuration,
    setCenter,
    setViewport,
  ]);

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_e, node) => onSelect(node.id),
    [onSelect],
  );

  const handleMove = useCallback(
    (_e: MouseEvent | TouchEvent | null, v: Viewport) => onViewportChange(v),
    [onViewportChange],
  );

  const handleMoveStart = useCallback(
    () => onInteractionChange(true),
    [onInteractionChange],
  );

  const handleMoveEnd = useCallback(
    (_e: MouseEvent | TouchEvent | null, v: Viewport) => {
      onViewportChange(v);
      onInteractionChange(false);
    },
    [onInteractionChange, onViewportChange],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodeClick={onNodeClick}
      onMove={handleMove}
      onMoveStart={handleMoveStart}
      onMoveEnd={handleMoveEnd}
      nodeTypes={stableNodeTypes}
      edgeTypes={stableEdgeTypes}
      onlyRenderVisibleElements
      minZoom={qualityProfile.camera.overviewZoom}
      maxZoom={qualityProfile.camera.focusZoom}
      translateExtent={translateExtentProp ?? layout.translateExtent}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      nodesFocusable={false}
      edgesFocusable={false}
      selectNodesOnDrag={false}
      panOnDrag
      panOnScroll={false}
      zoomOnScroll
      zoomOnPinch
      zoomOnDoubleClick={false}
      preventScrolling
      proOptions={{ hideAttribution: true }}
      defaultEdgeOptions={{ type: "writing-edge" }}
      elevateEdgesOnSelect={false}
      className="!bg-transparent [&_.react-flow__pane]:cursor-grab [&_.react-flow__pane.dragging]:cursor-grabbing"
    >
      <Background
        className="kanji-bg-board-lines"
        variant={BackgroundVariant.Lines}
        gap={160}
        lineWidth={1.15}
        color="rgba(18, 18, 22, 0.20)"
      />
      <Background
        className="kanji-bg-board-hoshi"
        variant={BackgroundVariant.Dots}
        gap={480}
        size={3.2}
        color="rgba(18, 18, 22, 0.34)"
      />
    </ReactFlow>
  );
}

export interface WritingBoardViewProps {
  items: WritingBoardProgress[];
  summary: WritingBoardSummary;
  scriptType: WritingScriptType;
  nodeTypes: NodeTypes;
  edgeTypes: EdgeTypes;
  loading?: boolean;
  error?: string | null;
  onNodeAction?: (item: WritingBoardProgress) => void;
  quizActive?: boolean;
  drawerOpen?: boolean;
  children?: React.ReactNode;
  initialNodeId?: string | null;
  focusedNodeId?: string | null;
  /** Enable mastery celebration system for this board. */
  masteryModuleId?: MasteryModuleId;
  /** User's current points for mastery detection. */
  masteryPoints?: number;
}

export function WritingBoardView({
  items,
  summary,
  scriptType,
  nodeTypes,
  edgeTypes,
  loading = false,
  error = null,
  onNodeAction,
  quizActive = false,
  drawerOpen = false,
  children,
  initialNodeId: initialNodeIdProp = null,
  focusedNodeId: focusedNodeIdProp = null,
  masteryModuleId,
  masteryPoints = 0,
}: WritingBoardViewProps) {
  const { graphicsProfile } = usePlatformMotion();
  const qualityProfile = useWritingBoardQuality(graphicsProfile);
  const { setHidden: _setHidden } = useSidebar();

  // Mastery: capture setCenter from the inner ReactFlow.
  const setCenterRef = useRef<SetCenterFn | null>(null);
  const handleSetCenterReady = useCallback((fn: SetCenterFn) => {
    setCenterRef.current = fn;
  }, []);
  const stableSetCenter = useCallback<SetCenterFn>(
    (x, y, opts) => setCenterRef.current?.(x, y, opts),
    [],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [shakingNodeId, setShakingNodeId] = useState<string | null>(null);
  const [newlyUnlockedIds, setNewlyUnlockedIds] =
    useState<ReadonlySet<string>>(new Set());
  const [unlockFocusNodeId, setUnlockFocusNodeId] = useState<string | null>(
    null,
  );

  const shakingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unlockAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const unlockFocusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hasInitializedUnlockSnapshotRef = useRef(false);
  const previousLockedIdsRef = useRef<Set<string> | null>(null);

  const drawerOpenRef = useRef(drawerOpen);
  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
    // Cancel parallax animation while drawer is open
    if (drawerOpen && viewportFrame.current !== null) {
      window.cancelAnimationFrame(viewportFrame.current);
      viewportFrame.current = null;
    }
  }, [drawerOpen]);

  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewportFrame = useRef<number | null>(null);
  const lastFrameTime = useRef<number | null>(null);
  const qualityProfileRef = useRef(qualityProfile);
  const shouldUseParallaxRef = useRef(graphicsProfile.shouldUseParallax);
  const isInteractingRef = useRef(false);
  const animateBackgroundViewportRef = useRef<(ts: number) => void>(
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
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const effectiveSelectedId = useMemo(() => {
    if (
      focusedNodeIdProp &&
      items.some((item) => item.id === focusedNodeIdProp)
    ) {
      return focusedNodeIdProp;
    }

    if (
      initialNodeIdProp &&
      items.some((item) => item.id === initialNodeIdProp)
    ) {
      return initialNodeIdProp;
    }

    if (
      unlockFocusNodeId &&
      items.some((item) => item.id === unlockFocusNodeId)
    ) {
      return unlockFocusNodeId;
    }

    if (selectedId && items.some((item) => item.id === selectedId)) {
      return selectedId;
    }

    return (
      getLastUnlockedNodeId(items) ??
      summary.currentItemId ??
      items[0]?.id ??
      null
    );
  }, [
    focusedNodeIdProp,
    initialNodeIdProp,
    unlockFocusNodeId,
    selectedId,
    items,
    summary.currentItemId,
  ]);

  const layoutIds = useMemo(() => items.map((i) => i.id), [items]);
  const layout = useMemo(
    () => buildWritingBoardLayout(layoutIds),
    [layoutIds],
  );

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

  const baseGraph = useMemo(
    () =>
      createBaseWritingBoardGraph(items, layout, qualityProfile, scriptType),
    [items, layout, qualityProfile, scriptType],
  );

  const graph = useMemo(
    () =>
      applyWritingBoardUIState(
        baseGraph,
        effectiveSelectedId,
        newlyUnlockedIds,
        shakingNodeId,
        drawerOpen,
      ),
    [baseGraph, effectiveSelectedId, newlyUnlockedIds, shakingNodeId, drawerOpen],
  );

  useEffect(() => {
    if (loading) return;

    const currentLockedIds = new Set(
      items.filter((item) => item.status === "locked").map((item) => item.id),
    );

    if (!hasInitializedUnlockSnapshotRef.current) {
      hasInitializedUnlockSnapshotRef.current = true;
      previousLockedIdsRef.current = currentLockedIds;
      return;
    }

    if (!previousLockedIdsRef.current) {
      previousLockedIdsRef.current = currentLockedIds;
      return;
    }

    const previousLockedIds = previousLockedIdsRef.current;
    previousLockedIdsRef.current = currentLockedIds;

    const unlockedIds = items
      .filter(
        (item) =>
          previousLockedIds.has(item.id) && item.status !== "locked",
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

    const raf = window.requestAnimationFrame(() => {
      setSelectedId(firstUnlockedId);
      setUnlockFocusNodeId(firstUnlockedId);
      setNewlyUnlockedIds(nextUnlockedIds);
    });

    unlockAnimationTimerRef.current = setTimeout(() => {
      setNewlyUnlockedIds(new Set());
    }, 2200);

    unlockFocusTimerRef.current = setTimeout(() => {
      setUnlockFocusNodeId(null);
    }, 2200);

    return () => window.cancelAnimationFrame(raf);
  }, [items, loading]);

  const backgroundStyle = useMemo(() => {
    const { width, height, pointerType } = graphicsProfile.signals;
    const compact = width <= 1180 || pointerType === "coarse";
    const diagonal = Math.hypot(width, height);
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

  const handleSelect = useCallback(
    (nodeId: string) => {
      const item = itemsRef.current.find((i) => i.id === nodeId);

      if (item?.status === "locked") {
        if (shakingTimerRef.current) clearTimeout(shakingTimerRef.current);
        setShakingNodeId(nodeId);
        shakingTimerRef.current = setTimeout(() => {
          setShakingNodeId(null);
        }, 640);
        return;
      }

      setSelectedId(nodeId);
      if (item && onNodeAction) onNodeAction(item);
    },
    [onNodeAction],
  );

  useEffect(() => {
    qualityProfileRef.current = qualityProfile;
    shouldUseParallaxRef.current = qualityProfile.graphics.shouldUseParallax;
  }, [qualityProfile]);

  const applyBgViewport = useCallback(
    (
      layer: HTMLDivElement,
      state: BackgroundViewportState,
      signals: WritingBoardQualitySignals,
    ) => {
      const fmt = formatBgViewport(state, signals);
      const prev = appliedViewportCss.current;

      if (fmt.x !== prev.x) {
        layer.style.setProperty("--kanji-camera-x", fmt.x);
      }
      if (fmt.y !== prev.y) {
        layer.style.setProperty("--kanji-camera-y", fmt.y);
      }
      if (fmt.zoom !== prev.zoom) {
        layer.style.setProperty("--kanji-camera-zoom", fmt.zoom);
      }

      appliedViewportCss.current = fmt;
    },
    [],
  );

  useEffect(() => {
    animateBackgroundViewportRef.current = (timestamp: number) => {
      viewportFrame.current = null;

      // Pause parallax while the lesson drawer is open
      if (drawerOpenRef.current) return;

      const layer = backgroundRef.current;
      if (!layer) return;

      const profile = qualityProfileRef.current;
      const signals = profile.graphics.signals;

      if (!profile.graphics.shouldUseParallax) {
        appliedViewport.current = { x: 0, y: 0, zoom: 1 };
        applyBgViewport(layer, appliedViewport.current, signals);
        lastFrameTime.current = null;
        return;
      }

      const prevTime = lastFrameTime.current ?? timestamp;
      const delta = Math.min(32, Math.max(8, timestamp - prevTime));
      lastFrameTime.current = timestamp;

      const target = latestViewport.current;
      const prev = appliedViewport.current;
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
        x: prev.x + (target.x - prev.x) * smoothing,
        y: prev.y + (target.y - prev.y) * smoothing,
        zoom: prev.zoom + (target.zoom - prev.zoom) * smoothing,
      };

      if (Math.abs(target.x - next.x) < profile.background.epsilonPosition) {
        next.x = target.x;
      }
      if (Math.abs(target.y - next.y) < profile.background.epsilonPosition) {
        next.y = target.y;
      }
      if (Math.abs(target.zoom - next.zoom) < profile.background.epsilonZoom) {
        next.zoom = target.zoom;
      }

      const hasMeaningfulChange =
        Math.abs(prev.x - next.x) >=
          profile.background.epsilonPosition * 0.5 ||
        Math.abs(prev.y - next.y) >=
          profile.background.epsilonPosition * 0.5 ||
        Math.abs(prev.zoom - next.zoom) >=
          profile.background.epsilonZoom * 0.5;

      if (hasMeaningfulChange) {
        appliedViewport.current = next;
        applyBgViewport(layer, next, signals);
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
      applyBgViewport(layer, appliedViewport.current, signals);
      lastFrameTime.current = null;
    };
  }, [applyBgViewport]);

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
      isInteractingRef.current = isInteracting;
      const val = isInteracting ? "true" : "false";

      if (backgroundRef.current) {
        backgroundRef.current.dataset.kanjiInteracting = val;
      }
      if (rootRef.current) {
        rootRef.current.dataset.kanjiInteracting = val;
      }

      if (!shouldUseParallaxRef.current) return;
      ensureViewportAnimation();
    },
    [ensureViewportAnimation],
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
      lastFrameTime.current = null;
    };
  }, []);

  if (loading) {
    return (
      <div className="absolute inset-0 bg-surface-primary">
        <WritingBoardLoading scriptType={scriptType} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-surface-primary">
        <p className="text-content-secondary text-sm">{error}</p>
      </div>
    );
  }

  const boardContent = (
    <div
      ref={rootRef}
      data-kanji-interacting="false"
      data-kanji-quiz-active={quizActive ? "true" : "false"}
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
        className="absolute inset-0"
        style={
          {
            contain: "layout paint style",
            ...backgroundStyle,
          } as React.CSSProperties
        }
      >
        <WritingBoardBackground
          qualityProfile={qualityProfile}
          graphicsProfile={graphicsProfile}
          scriptType={scriptType}
        />
      </div>

      <div className="absolute inset-0 z-10">
        <ReactFlowProvider>
          <WritingBoardMapInner
            nodes={graph.nodes}
            edges={graph.edges}
            layout={layout}
            onSelect={handleSelect}
            onViewportChange={syncViewportToScene}
            initialNodeId={effectiveSelectedId}
            focusedNodeId={focusedNodeIdProp ?? unlockFocusNodeId}
            onInteractionChange={handleInteractionChange}
            qualityProfile={qualityProfile}
            translateExtent={translateExtent}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            onSetCenterReady={handleSetCenterReady}
          />
        </ReactFlowProvider>
      </div>

      {children}
    </div>
  );

  if (masteryModuleId) {
    return (
      <MasteryBoardWrapper
        moduleId={masteryModuleId}
        currentPoints={masteryPoints}
        totalItems={items.length}
        completedItems={summary.completedCount}
        nodes={graph.nodes}
        setCenter={stableSetCenter}
        tourZoom={qualityProfile.camera.focusZoom}
      >
        {boardContent}
      </MasteryBoardWrapper>
    );
  }

  return boardContent;
}