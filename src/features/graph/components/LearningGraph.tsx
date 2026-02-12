"use client";

import { useCallback, useState } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import CustomNode from "./CustomNode";
import CustomEdge from "./CustomEdge";
import { GraphNode, GraphEdge } from "@/features/graph/lib/graphTypes";

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

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
  const [activeTab, setActiveTab] = useState<"explore" | "grammar">("explore");

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Tabs */}
      <Panel position="top-center" className="bg-transparent z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 bg-white/90 backdrop-blur-md rounded-xl p-1.5 shadow-lg border border-gray-100"
        >
          <button
            onClick={() => setActiveTab("explore")}
            className={`
              px-8 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200
              ${
                activeTab === "explore"
                  ? "bg-gradient-to-r from-[#993331] to-[#7a2826] text-white shadow-md shadow-[#993331]/30"
                  : "text-gray-600 hover:bg-gray-100"
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
                  ? "bg-gradient-to-r from-[#993331] to-[#7a2826] text-white shadow-md shadow-[#993331]/30"
                  : "text-gray-600 hover:bg-gray-100"
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
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 150,
          includeHiddenNodes: false,
        }}
        minZoom={0.3}
        maxZoom={2}
        defaultEdgeOptions={{
          type: "custom",
          animated: false,
        }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        nodesConnectable={false}
        panOnDrag={true}
        panOnScroll={false}
        zoomOnScroll={true}
        zoomOnPinch={true}
        preventScrolling={true}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="#993331" 
          className="opacity-[0.08]"
        />
        
        <Controls 
          className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl shadow-xl overflow-hidden !m-4 z-10"
          showInteractive={false}
        />
      </ReactFlow>
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
