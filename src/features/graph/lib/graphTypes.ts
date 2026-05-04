import { Node, Edge } from "reactflow";

export type NodeType =
  | "home"
  | "writing"
  | "listening"
  | "reading"
  | "speaking";

export type NodeStatus = "completed" | "available" | "locked";
export interface GraphNodeData {
  label: string;
  type: NodeType;
  status: NodeStatus;
  icon: React.ReactNode;

  entityKind?: "kanji" | "theme" | "subtheme" | "word" | "grammar";
  entityId?: string;
  graphId?: string;
  recommendationId?: string;
  similarity?: number;
  isRecommendation?: boolean;
  symbol?: string;

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

export interface GraphLayoutConfig {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  radius: number;
  homeY: number;
  paddingX: number;
  paddingTop: number;
  paddingBottom: number;
  nodeSpacing?: number;
}
