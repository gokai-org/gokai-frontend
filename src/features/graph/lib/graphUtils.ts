import { GraphNode, GraphEdge, NodeStatus } from "./graphTypes";
import { GRAPH_CONFIG } from "./graphConfig";

/**
 * Calcula qué handle usar basándose en la posición relativa entre dos nodos
 */
function getOptimalHandles(
  sourceNode: GraphNode,
  targetNode: GraphNode
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
 * Genera un grafo de aprendizaje circular con un nodo central
 */
export function generateLearningGraph(): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const { centerX, centerY, radius } = GRAPH_CONFIG.layout;

  // Nodo central (Home)
  const homeNode: GraphNode = {
    id: "home",
    type: "custom",
    position: { x: centerX, y: centerY },
    data: {
      label: "Inicio",
      type: "home",
      status: "completed",
      icon: null,
    },
  };

  // Configuración de nodos alrededor del centro con posiciones variadas
  const satelliteNodes: Array<{
    id: string;
    type: "writing" | "listening" | "reading" | "speaking";
    label: string;
    status: NodeStatus;
    radiusOffset?: number;
    angleOffset?: number;
  }> = [
    { 
      id: "writing-1", 
      type: "writing", 
      label: "Escritura 1", 
      status: "completed",
      radiusOffset: 0.9,
      angleOffset: 0.1
    },
    { 
      id: "listening-1", 
      type: "listening", 
      label: "Audio 1", 
      status: "completed",
      radiusOffset: 1.0
    },
    { 
      id: "reading-1", 
      type: "reading", 
      label: "Lectura 1", 
      status: "available",
      radiusOffset: 1.2,
      angleOffset: -0.15
    },
    { 
      id: "speaking-1", 
      type: "speaking", 
      label: "Hablar 1", 
      status: "locked",
      radiusOffset: 0.85
    },
    { 
      id: "writing-2", 
      type: "writing", 
      label: "Escritura 2", 
      status: "available",
      radiusOffset: 1.1,
      angleOffset: 0.2
    },
    { 
      id: "listening-2", 
      type: "listening", 
      label: "Audio 2", 
      status: "completed",
      radiusOffset: 0.95
    },
    { 
      id: "reading-2", 
      type: "reading", 
      label: "Lectura 2", 
      status: "locked",
      radiusOffset: 1.15,
      angleOffset: -0.1
    },
    { 
      id: "speaking-2", 
      type: "speaking", 
      label: "Hablar 2", 
      status: "locked",
      radiusOffset: 0.8
    },
    { 
      id: "writing-3", 
      type: "writing", 
      label: "Escritura 3", 
      status: "completed",
      radiusOffset: 1.05,
      angleOffset: 0.15
    },
    { 
      id: "listening-3", 
      type: "listening", 
      label: "Audio 3", 
      status: "available",
      radiusOffset: 1.25,
      angleOffset: -0.2
    },
    { 
      id: "reading-3", 
      type: "reading", 
      label: "Lectura 3", 
      status: "locked",
      radiusOffset: 0.9
    },
    { 
      id: "speaking-3", 
      type: "speaking", 
      label: "Hablar 3", 
      status: "locked",
      radiusOffset: 1.0,
      angleOffset: 0.1
    },
  ];

  // Posicionar nodos en círculo con variaciones y calcular ángulos
  const nodesWithAngles: Array<{ node: GraphNode; angle: number }> = [];
  
  satelliteNodes.forEach((node, index) => {
    const baseAngle = (index / satelliteNodes.length) * 2 * Math.PI - Math.PI / 2;
    const angleOffset = node.angleOffset || 0;
    const angle = baseAngle + angleOffset;
    
    const radiusMultiplier = node.radiusOffset || 1.0;
    const nodeRadius = radius * radiusMultiplier;
    
    const x = centerX + nodeRadius * Math.cos(angle);
    const y = centerY + nodeRadius * Math.sin(angle);

    nodesWithAngles.push({
      node: {
        id: node.id,
        type: "custom",
        position: { x, y },
        data: {
          label: node.label,
          type: node.type,
          status: node.status,
          icon: null,
        },
      },
      angle,
    });
  });

  const nodes: GraphNode[] = [
    homeNode,
    ...nodesWithAngles.map((item) => item.node),
  ];

  // Crear conexiones desde el centro a todos los nodos con handles calculados
  const edges: GraphEdge[] = nodesWithAngles.map(({ node }) => {
    const { sourceHandle, targetHandle } = getOptimalHandles(homeNode, node);
    const edge: GraphEdge = {
      id: `home-${node.id}`,
      source: "home",
      target: node.id,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: "custom" as const,
      data: {
        status: node.data.status === "completed" ? "completed" : "default",
      },
    };
    return edge;
  });

  // Crear mapa de nodos para buscar fácilmente por ID
  const nodeMap = new Map<string, GraphNode>();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  // Algunas conexiones entre nodos satélite con handles calculados
  const additionalConnections: Array<{
    source: string;
    target: string;
    status: "completed" | "default";
  }> = [
    { source: "writing-1", target: "listening-1", status: "completed" },
    { source: "listening-1", target: "reading-1", status: "completed" },
    { source: "writing-2", target: "listening-2", status: "default" },
    { source: "listening-2", target: "reading-2", status: "default" },
    { source: "writing-3", target: "listening-3", status: "completed" },
    { source: "reading-1", target: "speaking-1", status: "default" },
  ];

  const additionalEdges: GraphEdge[] = additionalConnections.map((conn) => {
    const sourceNode = nodeMap.get(conn.source);
    const targetNode = nodeMap.get(conn.target);
    
    if (!sourceNode || !targetNode) {
      throw new Error(`Nodo no encontrado: ${conn.source} o ${conn.target}`);
    }
    
    const { sourceHandle, targetHandle } = getOptimalHandles(sourceNode, targetNode);
    
    const edge: GraphEdge = {
      id: `${conn.source}-${conn.target}`,
      source: conn.source,
      target: conn.target,
      sourceHandle: sourceHandle,
      targetHandle: targetHandle,
      type: "custom" as const,
      data: { status: conn.status },
    };
    return edge;
  });

  return {
    nodes,
    edges: [...edges, ...additionalEdges],
  };
}

/**
 * Actualiza el estado de un nodo en el grafo
 */
export function updateNodeStatus(
  nodes: GraphNode[],
  nodeId: string,
  newStatus: NodeStatus
): GraphNode[] {
  return nodes.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, status: newStatus } }
      : node
  );
}

/**
 * Calcula el progreso del usuario basado en nodos completados
 */
export function calculateProgress(nodes: GraphNode[]): number {
  const total = nodes.length - 1; // Excluir nodo home
  const completed = nodes.filter(
    (node) => node.data.status === "completed" && node.id !== "home"
  ).length;
  return (completed / total) * 100;
}
