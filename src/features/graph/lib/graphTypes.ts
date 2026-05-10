import { Node, Edge } from "reactflow";

export type NodeType =
  | "home"
  | "writing"
  | "listening"
  | "reading"
  | "speaking";

export type NodeStatus = "completed" | "available" | "locked";
export type GraphNodeVisualVariant = "red" | "black" | "white";

export interface GraphNodeData {
  label: string;
  type: NodeType;
  status: NodeStatus;
  icon: React.ReactNode;
  imageUrl?: string | null;
  visualVariant?: GraphNodeVisualVariant;

  entityKind?: "kanji" | "theme" | "subtheme" | "word" | "grammar";
  entityId?: string;
  graphId?: string;
  symbol?: string;

  description?: string;
  displayLabel?: string;
  progress?: number;
  userId?: string;
  isAiRecommended?: boolean;
  recommendationRank?: number;
  recommendationSimilarity?: number;
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
