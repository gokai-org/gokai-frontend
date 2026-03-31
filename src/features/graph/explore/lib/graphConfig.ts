import { NodeType, NodeStatus } from "@/features/graph/lib/graphTypes";

/**
 * Configuración visual del grafo
 */
export const GRAPH_CONFIG = {
  colors: {
    primary: "#993331",
    primaryDark: "#7a2826",
    primaryLight: "#cc6663",
    completed: "#993331",
    available: "#993331",
    locked: "#d1d5db",
    background: {
      from: "#fffbf5",
      via: "#ffffff",
      to: "#fff5f5",
    },
  },
  sizes: {
    homeNode: { width: 28, height: 28, icon: 44 },
    regularNode: { width: 20, height: 20, icon: 28 },
  },
  animation: {
    duration: 0.3,
    stiffness: 300,
    damping: 20,
  },
  layout: {
    centerX: 400,
    centerY: 300,
    radius: 250,
  },
} as const;

/**
 * Configuración de tipos de nodos
 */
export const NODE_TYPE_CONFIG: Record<
  NodeType,
  { label: string; color: string }
> = {
  home: { label: "Inicio", color: GRAPH_CONFIG.colors.primary },
  writing: { label: "Escritura", color: GRAPH_CONFIG.colors.primary },
  listening: { label: "Audio", color: GRAPH_CONFIG.colors.primary },
  reading: { label: "Lectura", color: GRAPH_CONFIG.colors.primary },
  speaking: { label: "Hablar", color: GRAPH_CONFIG.colors.primary },
};

/**
 * Configuración de estados de nodos
 */
export const NODE_STATUS_CONFIG: Record<
  NodeStatus,
  { opacity: number; showIndicator: boolean }
> = {
  completed: { opacity: 1, showIndicator: true },
  available: { opacity: 0.8, showIndicator: false },
  locked: { opacity: 0.6, showIndicator: true },
};
