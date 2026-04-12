"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  type NodeMouseHandler,
  type NodeTypes,
  type EdgeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { AnimatePresence } from "framer-motion";
import GrammarBoardNode from "./board/GrammarBoardNode";
import GrammarBoardEdge from "./board/GrammarBoardEdge";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarExamModal from "./lesson/exam/GrammarExamModal";
import { useGrammarLessons } from "../hooks/useGrammarLessons";
import {
  GRAMMAR_NODE_CENTER_X,
  GRAMMAR_NODE_CENTER_Y,
  buildGrammarBoardLayout,
  createGrammarBoardGraph,
  getFirstFocusId,
} from "../lib/grammarBoardBuilder";
import { handleReactFlowError } from "@/features/graph/lib/reactFlowErrorHandler";

// ── Static nodeTypes/edgeTypes (must be outside component) ──
const GRAMMAR_NODE_TYPES: NodeTypes = { "grammar-node": GrammarBoardNode };
const GRAMMAR_EDGE_TYPES: EdgeTypes = { "grammar-edge": GrammarBoardEdge };
const GRAMMAR_PRO_OPTIONS = { hideAttribution: true };

function getGrammarDrawerWidth() {
  if (typeof window === "undefined") return 0;
  if (window.innerWidth < 1024) return 0;

  return Math.min(window.innerWidth * 0.58, 760);
}

// ── Inner board (needs ReactFlow context) ──────────────────
function GrammarBoardInner() {
  const { setCenter } = useReactFlow();
  const [stableNodeTypes] = useState(() => GRAMMAR_NODE_TYPES);
  const [stableEdgeTypes] = useState(() => GRAMMAR_EDGE_TYPES);

  const { boardItems, status } = useGrammarLessons();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examLessonId, setExamLessonId] = useState<string | null>(null);
  const focusedRef = useRef(false);

  const layout = useMemo(() => {
    if (!boardItems.length) return null;
    return buildGrammarBoardLayout(boardItems.map((it) => it.id));
  }, [boardItems]);

  const { nodes, edges } = useMemo(() => {
    if (!layout) return { nodes: [], edges: [] };
    return createGrammarBoardGraph(boardItems, layout, selectedId, selectedId !== null);
  }, [boardItems, layout, selectedId]);

  const focusNode = useCallback(
    (nodeId: string, zoom: number, duration: number, reserveDrawerSpace: boolean) => {
      if (!layout) return;

      const targetNode = layout.nodes.find((node) => node.id === nodeId);
      if (!targetNode) return;

      const drawerWidth = reserveDrawerSpace ? getGrammarDrawerWidth() : 0;
      const xOffset = drawerWidth > 0 ? drawerWidth / (2 * zoom) : 0;

      requestAnimationFrame(() => {
        setCenter(
          targetNode.position.x + GRAMMAR_NODE_CENTER_X + xOffset,
          targetNode.position.y + GRAMMAR_NODE_CENTER_Y,
          { zoom, duration },
        );
      });
    },
    [layout, setCenter],
  );

  // Focus camera on first available node once data loads
  useEffect(() => {
    if (focusedRef.current || !boardItems.length || !layout) return;
    const targetId = getFirstFocusId(boardItems);
    if (!targetId) return;

    focusedRef.current = true;
    focusNode(targetId, 0.96, 600, false);
  }, [boardItems, focusNode, layout]);

  useEffect(() => {
    if (!selectedId) return;
    focusNode(selectedId, 1.2, 460, true);
  }, [focusNode, selectedId]);

  const handleNodeClick = useCallback<NodeMouseHandler>(
    (_evt, node) => {
      const item = boardItems.find((it) => it.id === node.id);
      if (!item || item.isMock) return;
      setSelectedId(node.id);
    },
    [boardItems],
  );

  const handleClose = useCallback(() => setSelectedId(null), []);
  const handleExamOpen  = useCallback(() => {
    if (selectedId) {
      setExamLessonId(selectedId);
      setSelectedId(null);
    }
  }, [selectedId]);
  const handleExamClose = useCallback(() => setExamLessonId(null), []);

  if (status === "loading" && !boardItems.length) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-pink-50 dark:bg-pink-950/30 animate-pulse">
            <span className="text-2xl font-black text-pink-500">文法</span>
          </div>
          <p className="text-sm text-content-secondary">Cargando gramática…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={stableNodeTypes}
        edgeTypes={stableEdgeTypes}
        onError={handleReactFlowError}
        onNodeClick={handleNodeClick}
        translateExtent={layout?.translateExtent as [[number,number],[number,number]] | undefined}
        minZoom={0.35}
        maxZoom={1.8}
        fitView={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={GRAMMAR_PRO_OPTIONS}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1.2}
          color="rgba(219,39,119,0.12)"
        />
      </ReactFlow>

      {selectedId && (
        <AnimatePresence>
          <GrammarLessonModal
            key={selectedId}
            lessonId={selectedId}
            onClose={handleClose}
            onExamOpen={handleExamOpen}
          />
        </AnimatePresence>
      )}

      <AnimatePresence>
        {examLessonId && (
          <GrammarExamModal
            key={`exam-${examLessonId}`}
            lessonId={examLessonId}
            onClose={handleExamClose}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ── Public export (wraps with ReactFlowProvider) ───────────
export default function GrammarView() {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <ReactFlowProvider>
        <GrammarBoardInner />
      </ReactFlowProvider>
    </div>
  );
}