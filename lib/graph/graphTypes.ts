import { Node, Edge } from "reactflow";

export type NodeType = "home" | "writing" | "listening" | "reading" | "speaking";

export type NodeStatus = "completed" | "available" | "locked";

export interface GraphNodeData {
  label: string;
  type: NodeType;
  status: NodeStatus;
  icon: React.ReactNode;
  description?: string;
  progress?: number;
  userId?: string;
}

export type GraphNode = Node<GraphNodeData>;

export interface GraphEdgeData {
  status?: "completed" | "default";
  animated?: boolean;
}

export type GraphEdge = Edge<GraphEdgeData> & {
  sourceHandle?: string;
  targetHandle?: string;
};

export interface LearningGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  userId: string;
  progress: number;
}

export interface GraphLayoutConfig {
  centerX: number;
  centerY: number;
  radius: number;
  nodeSpacing?: number;
}
