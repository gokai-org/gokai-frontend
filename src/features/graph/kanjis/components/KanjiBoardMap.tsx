"use client";

import { memo, useCallback, useEffect, useRef } from "react";
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

const nodeTypes = {
  "kanji-planet": KanjiBoardNode,
};

const edgeTypes = {
  "kanji-constellation": KanjiBoardEdge,
};

const PLANET_CENTER_X = 84;
const PLANET_CENTER_Y = 78;

interface KanjiBoardMapProps {
  nodes: KanjiNode[];
  edges: KanjiEdge[];
  layout: KanjiBoardLayout;
  onSelect: (nodeId: string) => void;
  onViewportChange: (viewport: Viewport) => void;
  initialNodeId: string | null;
  focusedNodeId: string | null;
  onInteractionChange: (isInteracting: boolean) => void;
  qualityProfile: KanjiBoardQualityProfile;
  translateExtent?: [[number, number], [number, number]];
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
  initialNodeId,
  focusedNodeId,
  onInteractionChange,
  qualityProfile,
  translateExtent: translateExtentProp,
}: KanjiBoardMapProps) {
  const { setCenter, getViewport, setViewport } = useReactFlow();
  const hasInitializedViewport = useRef(false);
  const savedViewport = useRef<Viewport | null>(null);
  const lastFocusedNodeId = useRef<string | null>(null);

  useEffect(() => {
    if (nodes.length === 0 || hasInitializedViewport.current) return;

    const frame = window.requestAnimationFrame(() => {
      hasInitializedViewport.current = true;
      const initialNode =
        nodes.find((node) => node.id === initialNodeId) ??
        nodes.find((node) => node.data.progress.status === "available") ??
        nodes[0];

      if (!initialNode) return;

      const focusPoint = getPlanetFocusPoint(initialNode);
      void setCenter(focusPoint.x, focusPoint.y, {
        zoom: qualityProfile.camera.overviewZoom,
        duration: qualityProfile.camera.initialDuration,
      });

      window.requestAnimationFrame(() => {
        onViewportChange(getViewport());
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    getViewport,
    initialNodeId,
    nodes,
    onViewportChange,
    qualityProfile.camera.initialDuration,
    qualityProfile.camera.overviewZoom,
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
    qualityProfile.camera.focusDuration,
    qualityProfile.camera.focusZoom,
    qualityProfile.camera.restoreDuration,
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
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
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
      defaultEdgeOptions={{ type: "kanji-constellation" }}
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
        lineWidth={0.9}
        color="rgba(18, 18, 22, 0.15)"
      />
      <Background
        className="kanji-bg-board-hoshi"
        variant={BackgroundVariant.Dots}
        gap={480}
        size={2.8}
        color="rgba(18, 18, 22, 0.28)"
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
