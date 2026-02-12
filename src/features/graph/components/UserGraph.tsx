"use client";

import LearningGraph from "@/features/graph/components/LearningGraph";
import { createCustomGraph, generateLevelNodes, generateConnections } from "@/features/graph/lib/graphBuilder";

interface UserGraphProps {
  userId: string;
  level?: number;
  completedActivities?: number;
}

/**
 * Componente reutilizable para mostrar el grafo de aprendizaje de un usuario
 * 
 * @example
 * ```tsx
 * <UserGraph userId="user123" level={1} completedActivities={5} />
 * ```
 */
export default function UserGraph({ 
  userId, 
  level = 1, 
  completedActivities = 0 
}: UserGraphProps) {
  // Generar nodos basados en el progreso del usuario
  const nodeDefinitions = generateLevelNodes(level, completedActivities);
  
  // Generar conexiones automáticas
  const connections = generateConnections(nodeDefinitions);
  
  // Crear el grafo
  const { nodes, edges } = createCustomGraph(nodeDefinitions, connections);

  return <LearningGraph initialNodes={nodes} initialEdges={edges} />;
}
