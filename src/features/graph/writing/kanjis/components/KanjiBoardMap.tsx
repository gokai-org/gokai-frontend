"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeMouseHandler,
  type Viewport,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import KanjiBoardEdge from "./KanjiBoardEdge";
import KanjiBoardNode from "./KanjiBoardNode";
import type { KanjiBoardLayout } from "../lib/boardBuilder";
import type {
  KanjiBoardEdge as KanjiEdge,
  KanjiBoardNode as KanjiNode,
  KanjiBoardQualityProfile,
} from "../types";
import { handleReactFlowError } from "@/features/graph/lib/reactFlowErrorHandler";
import { getDrawerAwareFocusViewport } from "../../shared/lib/focusViewport";

const nodeTypes = {
  "kanji-planet": KanjiBoardNode,
};

const edgeTypes = {
  "kanji-constellation": KanjiBoardEdge,
};

const KANJI_PRO_OPTIONS = { hideAttribution: true };
const KANJI_DEFAULT_EDGE_OPTIONS = { type: "kanji-constellation" };

const PLANET_CENTER_X = 84;
const PLANET_CENTER_Y = 78;

type SetCenterFn = (x: number, y: number, options: { zoom: number; duration: number }) => void;

interface KanjiBoardMapProps {
  nodes: KanjiNode[];
  edges: KanjiEdge[];
  layout: KanjiBoardLayout;
  onSelect: (nodeId: string) => void;
  onViewportChange: (viewport: Viewport) => void;
  initialNodeId: string | null;
  focusedNodeId: string | null;
  drawerOpen: boolean;
  onInteractionChange: (isInteracting: boolean) => void;
  qualityProfile: KanjiBoardQualityProfile;
  translateExtent?: [[number, number], [number, number]];
  onSetCenterReady?: (fn: SetCenterFn) => void;
}

function getPlanetFocusPoint(node: KanjiNode) {
  const width =
    typeof node.style?.width === "number"
      ? node.style.width
      : PLANET_CENTER_X * 2;

  return {
    x: node.position.x + width / 2,
    y: node.position.y + PLANET_CENTER_Y,
  };
}

function KanjiBoardMapInner({
  nodes,
  edges,
  layout,
  onSelect,
  onViewportChange,
  initialNodeId: _initialNodeId,
  focusedNodeId,
  drawerOpen,
  onInteractionChange,
  qualityProfile,
  translateExtent: translateExtentProp,
  onSetCenterReady,
}: KanjiBoardMapProps) {
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
      // Entrance focus: last available node = most recently unlocked frontier
      // Falls back to nodes[0] if all are locked or all are completed
      const lastAvailableNode = [...nodes]
        .slice()
        .reverse()
        .find((node) => node.data.progress.status === "available");
      const initialNode = lastAvailableNode ?? nodes[0];

      if (!initialNode) return;

      const focusPoint = getPlanetFocusPoint(initialNode);
      void setCenter(focusPoint.x, focusPoint.y, {
        zoom: qualityProfile.camera.focusZoom,
        duration: qualityProfile.camera.initialDuration,
      });

      window.requestAnimationFrame(() => {
        onViewportChange(getViewport());
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    getViewport,
    nodes,
    onViewportChange,
    qualityProfile.camera.initialDuration,
    qualityProfile.camera.focusZoom,
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

      if (drawerOpen) {
        void setViewport(
          getDrawerAwareFocusViewport({
            focusX: focusPoint.x,
            focusY: focusPoint.y,
            zoom: qualityProfile.camera.drawerFocusZoom,
            viewportWidth: qualityProfile.signals.width,
            viewportHeight: qualityProfile.signals.height,
            drawerOpen,
          }),
          {
            duration: qualityProfile.camera.focusDuration,
          },
        );
      } else {
        void setCenter(focusPoint.x, focusPoint.y, {
          zoom: qualityProfile.camera.focusZoom,
          duration: qualityProfile.camera.focusDuration,
        });
      }

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
    qualityProfile.camera.drawerFocusZoom,
    qualityProfile.camera.focusDuration,
    qualityProfile.camera.focusZoom,
    qualityProfile.camera.restoreDuration,
    qualityProfile.signals.height,
    qualityProfile.signals.width,
    drawerOpen,
    setCenter,
    setViewport,
  ]);

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      onSelect(node.id);
    },
    [onSelect],
  );

  const handleMove = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      onViewportChange(viewport);
    },
    [onViewportChange],
  );

  const handleMoveStart = useCallback(() => {
    onInteractionChange(true);
  }, [onInteractionChange]);

  const handleMoveEnd = useCallback(
    (_event: MouseEvent | TouchEvent | null, viewport: Viewport) => {
      onViewportChange(viewport);
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
      onError={handleReactFlowError}
      nodeTypes={stableNodeTypes}
      edgeTypes={stableEdgeTypes}
      onlyRenderVisibleElements
      minZoom={qualityProfile.camera.overviewZoom}
      maxZoom={qualityProfile.camera.drawerFocusZoom}
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
      proOptions={KANJI_PRO_OPTIONS}
      defaultEdgeOptions={KANJI_DEFAULT_EDGE_OPTIONS}
      elevateEdgesOnSelect={false}
      className="!bg-transparent [&_.react-flow__pane]:cursor-grab [&_.react-flow__pane.dragging]:cursor-grabbing"
    >
      {/*
       * World-aligned board grid
       */}
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

export const KanjiBoardMap = memo(function KanjiBoardMap(
  props: KanjiBoardMapProps,
) {
  return (
    <ReactFlowProvider>
      <KanjiBoardMapInner {...props} />
    </ReactFlowProvider>
  );
});
