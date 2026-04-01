"use client";

import { useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeMouseHandler,
  type Viewport,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import KanjiConstellationEdge from "./KanjiConstellationEdge";
import KanjiConstellationNode from "./KanjiConstellationNode";
import type { KanjiConstellationLayout } from "../lib/constellationBuilder";
import type {
  KanjiConstellationEdge as KanjiEdge,
  KanjiConstellationNode as KanjiNode,
  KanjiConstellationQualityProfile,
} from "../types";

const nodeTypes = {
  "kanji-planet": KanjiConstellationNode,
};

const edgeTypes = {
  "kanji-constellation": KanjiConstellationEdge,
};

const PLANET_CENTER_X = 84;
const PLANET_CENTER_Y = 78;

interface KanjiConstellationMapProps {
  nodes: KanjiNode[];
  edges: KanjiEdge[];
  layout: KanjiConstellationLayout;
  onSelect: (nodeId: string) => void;
  onViewportChange: (viewport: Viewport) => void;
  initialNodeId: string | null;
  focusedNodeId: string | null;
  onInteractionChange: (isInteracting: boolean) => void;
  qualityProfile: KanjiConstellationQualityProfile;
  translateExtent?: [[number, number], [number, number]];
}

function getPlanetFocusPoint(node: KanjiNode) {
  const width = typeof node.style?.width === "number" ? node.style.width : PLANET_CENTER_X * 2;

  return {
    x: node.position.x + width / 2,
    y: node.position.y + PLANET_CENTER_Y,
  };
}

function KanjiConstellationMapInner({
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
}: KanjiConstellationMapProps) {
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
    void setViewport(previousViewport, { duration: qualityProfile.camera.restoreDuration });

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
       * World-aligned board grid — both layers live in React Flow's world coordinate
       * system, identical to the nodes. Pan/zoom moves everything together: the grid
       * and the nodes are on the same surface. This is the key fix for the "nodes
       * floating over texture" perception.
       */}
      <Background
        className="kanji-bg-board-lines"
        variant={BackgroundVariant.Lines}
        gap={160}
        lineWidth={0.7}
        color="rgba(18, 18, 22, 0.09)"
      />
      <Background
        className="kanji-bg-board-hoshi"
        variant={BackgroundVariant.Dots}
        gap={480}
        size={2.5}
        color="rgba(18, 18, 22, 0.19)"
      />
    </ReactFlow>
  );
}

export function KanjiConstellationMap(props: KanjiConstellationMapProps) {
  return (
    <ReactFlowProvider>
      <KanjiConstellationMapInner {...props} />
    </ReactFlowProvider>
  );
}
