"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
  NodeMouseHandler,
  useReactFlow,
  type Viewport,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import type { GraphNode, GraphEdge } from "@/features/graph/lib/graphTypes";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { useSidebar } from "@/shared/components/SidebarContext";

// Importante: tu NodeType incluye "home"
type LessonMode = "writing" | "listening" | "reading" | "speaking";

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

interface LearningGraphProps {
  initialNodes: GraphNode[];
  initialEdges: GraphEdge[];
}

function LearningGraphInner({
  initialNodes,
  initialEdges,
}: LearningGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const [activeTab, setActiveTab] = useState<"explore" | "grammar">("explore");

  const [lessonOpen, setLessonOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<LessonMode>("writing");
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedEntityKind, setSelectedEntityKind] = useState<
    "kanji" | "subtheme" | "grammar" | null
  >(null);

  const userId = "user123";
  const { setHidden: setSidebarHidden } = useSidebar();
  const { setViewport, getViewport, setCenter } = useReactFlow();
  const savedViewport = useRef<Viewport | null>(null);

  // Hide sidebar when lesson drawer is open
  useEffect(() => {
    setSidebarHidden(lessonOpen);
    return () => setSidebarHidden(false);
  }, [lessonOpen, setSidebarHidden]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = useCallback<NodeMouseHandler>(
    (_event, node) => {
      const nodeType = node.data?.type;

      if (!nodeType || nodeType === "home") return;

      setSelectedEntityId(node.data?.entityId ?? null);
      setSelectedEntityKind(node.data?.entityKind ?? null);

      const mode: LessonMode =
        nodeType === "writing" ||
        nodeType === "listening" ||
        nodeType === "reading" ||
        nodeType === "speaking"
          ? nodeType
          : "reading";

      setSelectedNodeId(node.id);
      setSelectedMode(mode);
      setLessonOpen(true);

      // Save current viewport and zoom to the clicked node
      savedViewport.current = getViewport();
      const posX = node.position.x + (node.width ?? 80) / 2;
      const posY = node.position.y + (node.height ?? 80) / 2;
      setCenter(posX, posY, { zoom: 1.3, duration: 500 });

      const url = new URL(window.location.href);
      url.searchParams.set("lessonId", node.id);
      window.history.replaceState({}, "", url.toString());
    },
    [getViewport, setCenter],
  );

  const closeDrawer = useCallback(() => {
    setLessonOpen(false);
    setSelectedNodeId(null);
    setSelectedEntityId(null);
    setSelectedEntityKind(null);

    // Restore previous viewport with animation
    if (savedViewport.current) {
      setViewport(savedViewport.current, { duration: 500 });
      savedViewport.current = null;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete("lessonId");
    window.history.replaceState({}, "", url.toString());
  }, [setViewport]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Tabs */}
      <Panel position="top-center" className="bg-transparent z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 bg-surface-primary/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-border-subtle"
        >
          <button
            onClick={() => setActiveTab("explore")}
            className={`
              px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                activeTab === "explore"
                  ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/30"
                  : "text-content-secondary hover:bg-surface-tertiary"
              }
            `}
          >
            Explorar
          </button>

          <button
            onClick={() => setActiveTab("grammar")}
            className={`
              px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                activeTab === "grammar"
                  ? "bg-gradient-to-r from-accent to-accent-hover text-content-inverted shadow-md shadow-accent/30"
                  : "text-content-secondary hover:bg-surface-tertiary"
              }
            `}
          >
            Gramática
          </button>
        </motion.div>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 150, includeHiddenNodes: false }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{ type: "custom", animated: false }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        preventScrolling
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="var(--accent)"
          className="opacity-[0.08]"
        />

        <Controls
          className="bg-surface-primary/90 backdrop-blur-md border border-border-default rounded-xl shadow-xl overflow-hidden !m-4 z-10"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Drawer de lecciones */}
      <LessonDrawer
        open={lessonOpen}
        onClose={closeDrawer}
        nodeId={selectedNodeId}
        mode={selectedMode}
        userId={userId}
        entityId={selectedEntityId}
        entityKind={selectedEntityKind}
      />
    </div>
  );
}

export default function LearningGraph(props: LearningGraphProps) {
  return (
    <ReactFlowProvider>
      <LearningGraphInner {...props} />
    </ReactFlowProvider>
  );
}
