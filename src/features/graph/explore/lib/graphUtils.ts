import { GraphNode, GraphEdge, NodeStatus } from "@/features/graph/lib/graphTypes";
import { GRAPH_CONFIG } from "./graphConfig";

/**
 * Calcula qué handle usar basándose en la posición relativa entre dos nodos
 */
function getOptimalHandles(
  sourceNode: GraphNode,
  targetNode: GraphNode,
): { sourceHandle: string; targetHandle: string } {
  const dx = targetNode.position.x - sourceNode.position.x;
  const dy = targetNode.position.y - sourceNode.position.y;

  // Calcular ángulo en radianes (-PI a PI)
  const angle = Math.atan2(dy, dx);

  // Convertir a grados (0-360)
  const degrees = ((angle * 180) / Math.PI + 360) % 360;

  // Determinar dirección principal del source (hacia dónde sale la arista)
  let sourceHandle: string;
  if (degrees >= 45 && degrees < 135) {
    sourceHandle = "source-bottom"; // hacia abajo
  } else if (degrees >= 135 && degrees < 225) {
    sourceHandle = "source-left"; // hacia la izquierda
  } else if (degrees >= 225 && degrees < 315) {
    sourceHandle = "source-top"; // hacia arriba
  } else {
    sourceHandle = "source-right"; // hacia la derecha
  }

  // El target handle es el opuesto (desde dónde entra la arista al nodo destino)
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
 * Actualiza el estado de un nodo en el grafo
 */
export function updateNodeStatus(
  nodes: GraphNode[],
  nodeId: string,
  newStatus: NodeStatus,
): GraphNode[] {
  return nodes.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, status: newStatus } }
      : node,
  );
}

/**
 * Calcula el progreso del usuario basado en nodos completados
 */
export function calculateProgress(nodes: GraphNode[]): number {
  const total = nodes.length - 1; // Excluir nodo home
  const completed = nodes.filter(
    (node) => node.data.status === "completed" && node.id !== "home",
  ).length;
  return (completed / total) * 100;
}
