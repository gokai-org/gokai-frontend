import {
  GraphNode,
  GraphEdge,
  NodeType,
  NodeStatus,
  GraphLayoutConfig,
} from "@/features/graph/lib/graphTypes";
import { GRAPH_CONFIG } from "./graphConfig";

interface NodeDefinition {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;
  description?: string;

  entityKind?: "kanji" | "theme" | "subtheme" | "word" | "grammar";
  entityId?: string;
  graphId?: string;
  recommendationId?: string;
  similarity?: number;
  isRecommendation?: boolean;
  symbol?: string;
  progress?: number;
}

type PositionedNodeDefinition = NodeDefinition & {
  position: { x: number; y: number };
};

type GraphConnection = { from: string; to: string; completed?: boolean };

const HOME_NODE_SIZE = 112;
const REGULAR_NODE_SIZE = 80;

/**
 * Calcula qué handle usar basándose en la posición relativa entre dos nodos
 */
function getOptimalHandles(
  sourceNode: GraphNode,
  targetNode: GraphNode,
): { sourceHandle: string; targetHandle: string } {
  const dx = targetNode.position.x - sourceNode.position.x;
  const dy = targetNode.position.y - sourceNode.position.y;

  const angle = Math.atan2(dy, dx);
  const degrees = ((angle * 180) / Math.PI + 360) % 360;

  let sourceHandle: string;
  if (degrees >= 45 && degrees < 135) {
    sourceHandle = "source-bottom";
  } else if (degrees >= 135 && degrees < 225) {
    sourceHandle = "source-left";
  } else if (degrees >= 225 && degrees < 315) {
    sourceHandle = "source-top";
  } else {
    sourceHandle = "source-right";
  }

  let targetHandle: string;
  const oppositeDegrees = (degrees + 180) % 360;
  if (oppositeDegrees >= 45 && oppositeDegrees < 135) {
    targetHandle = "target-bottom";
  } else if (oppositeDegrees >= 135 && oppositeDegrees < 225) {
    targetHandle = "target-left";
  } else if (oppositeDegrees >= 225 && oppositeDegrees < 315) {
    targetHandle = "target-top";
  } else {
    targetHandle = "target-right";
  }

  return { sourceHandle, targetHandle };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getChildRowCounts(childCount: number) {
  if (childCount <= 0) {
    return [];
  }

  const maxColumns =
    childCount <= 4
      ? 2
      : childCount <= 8
        ? 3
        : childCount <= 14
          ? 4
          : 5;
  const rows = Math.max(1, Math.ceil(childCount / maxColumns));
  const baseCount = Math.floor(childCount / rows);
  const extraCount = childCount % rows;

  return Array.from({ length: rows }, (_, index) => baseCount + (index < extraCount ? 1 : 0));
}

function buildPositionedDefinitions(
  nodes: NodeDefinition[],
  layoutConfig: GraphLayoutConfig,
): PositionedNodeDefinition[] {
  const homeNode = nodes.find((node) => node.type === "home");
  const childNodes = homeNode
    ? nodes.filter((node) => node.id !== homeNode.id)
    : [...nodes];
  const rowCounts = getChildRowCounts(childNodes.length);
  const centerX = layoutConfig.centerX;
  const homeCenterY = clamp(
    layoutConfig.homeY,
    layoutConfig.paddingTop + HOME_NODE_SIZE / 2,
    layoutConfig.height * 0.28,
  );
  const childLeft = layoutConfig.paddingX;
  const childRight = layoutConfig.width - layoutConfig.paddingX;
  const usableWidth = Math.max(childRight - childLeft, REGULAR_NODE_SIZE * 2);
  const childTop = homeNode
    ? homeCenterY + HOME_NODE_SIZE / 2 + 88
    : layoutConfig.paddingTop + REGULAR_NODE_SIZE / 2;
  const childBottom = layoutConfig.height - layoutConfig.paddingBottom;
  const usableHeight = Math.max(childBottom - childTop, REGULAR_NODE_SIZE * 2);
  const rows = Math.max(rowCounts.length, 1);

  const positioned: PositionedNodeDefinition[] = [];

  if (homeNode) {
    positioned.push({
      ...homeNode,
      position: {
        x: centerX - HOME_NODE_SIZE / 2,
        y: homeCenterY - HOME_NODE_SIZE / 2,
      },
    });
  }

  let offset = 0;

  rowCounts.forEach((count, rowIndex) => {
    const nodesInRow = childNodes.slice(offset, offset + count);
    offset += count;

    const rowCenterY = childTop + (usableHeight * (rowIndex + 0.5)) / rows;
    const rowWidthFactor = count === 1 ? 0 : 0.52 + Math.min(count, 5) * 0.1;
    const rowWidth = count === 1 ? 0 : usableWidth * Math.min(rowWidthFactor, 0.92);
    const rowStartX = centerX - rowWidth / 2;

    nodesInRow.forEach((node, columnIndex) => {
      const nodeCenterX =
        count === 1
          ? centerX
          : rowStartX + (rowWidth * (columnIndex + 0.5)) / count;
      const stagger = rowIndex % 2 === 0 ? -8 : 8;
      const nodeCenterY = rowCenterY + (count > 1 ? stagger * ((columnIndex % 2 === 0 ? 1 : -1) * 0.35) : 0);

      positioned.push({
        ...node,
        position: {
          x: clamp(nodeCenterX - REGULAR_NODE_SIZE / 2, childLeft, childRight - REGULAR_NODE_SIZE),
          y: clamp(nodeCenterY - REGULAR_NODE_SIZE / 2, childTop, childBottom - REGULAR_NODE_SIZE),
        },
      });
    });
  });

  return positioned;
}

function pushConnection(
  connections: GraphConnection[],
  seenConnections: Set<string>,
  from: string,
  to: string,
  completed: boolean,
) {
  const key = `${from}:${to}`;

  if (seenConnections.has(key)) {
    return;
  }

  seenConnections.add(key);
  connections.push({ from, to, completed });
}

/**
 * Crea un grafo personalizado con la configuración especificada
 */
export function createCustomGraph(
  nodes: NodeDefinition[],
  connections: GraphConnection[],
  layoutConfig?: Partial<GraphLayoutConfig>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const config = {
    ...GRAPH_CONFIG.layout,
    ...layoutConfig,
  };

  const positionedNodes = buildPositionedDefinitions(nodes, config);

  // Crear nodos
  const graphNodes: GraphNode[] = positionedNodes.map((node) => {
    const isHome = node.type === "home";

    return {
      id: node.id,
      type: "custom",
      position: node.position,
      draggable: false,
      selectable: false,
      focusable: false,
      data: {
        label: node.label,
        description: node.description,
        displayLabel: node.description || node.label,
        type: node.type,
        status: node.status,
        icon: null,
        entityKind: node.entityKind,
        entityId: node.entityId,
        graphId: node.graphId,
        recommendationId: node.recommendationId,
        similarity: node.similarity,
        isRecommendation: node.isRecommendation,
        symbol: node.symbol,
        progress: node.progress,
      },
    };
  });

  // Crear aristas con handles calculados
  const nodeMap = new Map<string, GraphNode>();
  graphNodes.forEach((node) => nodeMap.set(node.id, node));

  const graphEdges: GraphEdge[] = connections.map((conn) => {
    const sourceNode = nodeMap.get(conn.from);
    const targetNode = nodeMap.get(conn.to);

    if (!sourceNode || !targetNode) {
      throw new Error(`Nodo no encontrado: ${conn.from} o ${conn.to}`);
    }

    const { sourceHandle, targetHandle } = getOptimalHandles(
      sourceNode,
      targetNode,
    );

    return {
      id: `${conn.from}-${conn.to}`,
      source: conn.from,
      target: conn.to,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: "custom" as const,
      data: {
        status: conn.completed ? "completed" : "default",
      },
    };
  });

  return { nodes: graphNodes, edges: graphEdges };
}

/**
 * Genera configuración de nodos para un nivel de aprendizaje
 */
export function generateLevelNodes(
  level: number,
  completedCount: number,
): NodeDefinition[] {
  const nodeTypes: NodeType[] = ["writing", "listening", "reading", "speaking"];
  const nodes: NodeDefinition[] = [
    {
      id: "home",
      type: "home",
      label: `Nivel ${level}`,
      status: "completed",
    },
  ];

  // Generar nodos de actividades
  for (let i = 0; i < 12; i++) {
    const typeIndex = i % nodeTypes.length;
    const status: NodeStatus =
      i < completedCount
        ? "completed"
        : i === completedCount
          ? "available"
          : "locked";

    nodes.push({
      id: `${nodeTypes[typeIndex]}-${Math.floor(i / nodeTypes.length) + 1}`,
      type: nodeTypes[typeIndex],
      label: `${nodeTypes[typeIndex]} ${Math.floor(i / nodeTypes.length) + 1}`,
      status,
    });
  }

  return nodes;
}

/**
 * Genera conexiones automáticas para un grafo
 */
export function generateConnections(
  nodes: NodeDefinition[],
): GraphConnection[] {
  const homeNode = nodes.find((n) => n.type === "home");
  const childNodes = homeNode
    ? nodes.filter((node) => node.id !== homeNode.id)
    : [...nodes];
  const rowCounts = getChildRowCounts(childNodes.length);
  const completionById = new Map(nodes.map((node) => [node.id, node.status === "completed"]));
  const rowGroups = rowCounts.map((count) => {
    const group = childNodes.splice(0, count);
    return group;
  });
  const connections: GraphConnection[] = [];
  const seenConnections = new Set<string>();

  if (homeNode) {
    const firstRow = rowGroups[0] ?? [];

    firstRow.forEach((node) => {
      pushConnection(
        connections,
        seenConnections,
        homeNode.id,
        node.id,
        Boolean(completionById.get(homeNode.id) && completionById.get(node.id)),
      );
    });
  }

  rowGroups.forEach((row, rowIndex) => {
    row.forEach((node, index) => {
      const previousNode = row[index - 1];

      if (previousNode) {
        pushConnection(
          connections,
          seenConnections,
          previousNode.id,
          node.id,
          Boolean(completionById.get(previousNode.id) && completionById.get(node.id)),
        );
      }

      const previousRow = rowGroups[rowIndex - 1];

      if (!previousRow?.length) {
        return;
      }

      const parentIndex =
        previousRow.length === 1
          ? 0
          : Math.round((index / Math.max(row.length - 1, 1)) * (previousRow.length - 1));
      const parentNode = previousRow[parentIndex];

      if (!parentNode) {
        return;
      }

      pushConnection(
        connections,
        seenConnections,
        parentNode.id,
        node.id,
        Boolean(completionById.get(parentNode.id) && completionById.get(node.id)),
      );
    });
  });

  return connections;
}
