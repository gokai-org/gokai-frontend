import {
  GraphNode,
  GraphEdge,
  NodeType,
  NodeStatus,
  GraphLayoutConfig,
} from "./graphTypes";
import { GRAPH_CONFIG } from "./graphConfig";

interface NodeDefinition {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;

  entityKind?: "kanji" | "subtheme" | "grammar";
  entityId?: string;
  symbol?: string;
}

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

/**
 * Crea un grafo personalizado con la configuración especificada
 */
export function createCustomGraph(
  nodes: NodeDefinition[],
  connections: Array<{ from: string; to: string; completed?: boolean }>,
  layoutConfig?: Partial<GraphLayoutConfig>,
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const config = {
    ...GRAPH_CONFIG.layout,
    ...layoutConfig,
  };

  // Crear nodos
  const graphNodes: GraphNode[] = nodes.map((node, index) => {
    const isHome = node.type === "home";
    let x, y;

    if (isHome) {
      x = config.centerX;
      y = config.centerY;
    } else {
      const angle =
        ((index - 1) / (nodes.length - 1)) * 2 * Math.PI - Math.PI / 2;
      x = config.centerX + config.radius * Math.cos(angle);
      y = config.centerY + config.radius * Math.sin(angle);
    }

    return {
      id: node.id,
      type: "custom",
      position: { x, y },
      data: {
        label: node.label,
        type: node.type,
        status: node.status,
        icon: null,
        entityKind: node.entityKind,
        entityId: node.entityId,
        symbol: node.symbol,
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
): Array<{ from: string; to: string; completed?: boolean }> {
  const homeNode = nodes.find((n) => n.type === "home");
  if (!homeNode) return [];

  const connections: Array<{ from: string; to: string; completed?: boolean }> =
    [];

  // Conectar home con todos
  nodes.forEach((node) => {
    if (node.id !== homeNode.id) {
      connections.push({
        from: homeNode.id,
        to: node.id,
        completed: node.status === "completed",
      });
    }
  });

  // Conectar nodos secuencialmente
  for (let i = 1; i < nodes.length - 1; i++) {
    if (i % 3 === 0) {
      connections.push({
        from: nodes[i].id,
        to: nodes[i + 1].id,
        completed:
          nodes[i].status === "completed" &&
          nodes[i + 1].status === "completed",
      });
    }
  }

  return connections;
}
