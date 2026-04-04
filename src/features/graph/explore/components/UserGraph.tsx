"use client";

import { useEffect, useMemo, useState } from "react";
import LearningGraph from "./LearningGraph";
import { createCustomGraph, generateConnections } from "../lib/graphBuilder";
import type { NodeType, NodeStatus } from "@/features/graph/lib/graphTypes";
import { listKanjis } from "@/features/kanji/api/kanjiApi";
import type { Kanji } from "@/features/kanji/types";

type NodeDefinition = {
  id: string;
  type: NodeType;
  label: string;
  status: NodeStatus;

  entityKind?: "kanji" | "subtheme" | "grammar";
  entityId?: string;
  symbol?: string;
};

interface UserGraphProps {
  userId: string;
  level?: number;
  completedActivities?: number;
}

export default function UserGraph({
  level = 1,
  completedActivities = 0,
}: UserGraphProps) {
  const [kanjis, setKanjis] = useState<Kanji[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    queueMicrotask(() => {
      if (alive) setLoading(true);
    });

    listKanjis()
      .then((data) => {
        if (!alive) return;
        setKanjis(data ?? []);
      })
      .catch(() => {
        if (!alive) return;
        setKanjis([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const nodeDefinitions: NodeDefinition[] = useMemo(() => {
    const nodes: NodeDefinition[] = [
      {
        id: "home",
        type: "home",
        label: `Nivel ${level}`,
        status: "completed",
      },
    ];

    //Cambiar kanji de previa
    const first = kanjis[0];
    if (first) {
      nodes.push({
        id: "writing-1",
        type: "writing",
        label: "Escritura 1",
        status: completedActivities >= 1 ? "completed" : "available",

        entityKind: "kanji",
        entityId: first.id,
        symbol: first.symbol,
      });
    } else {
      // fallback si aún no carga / no hay data
      nodes.push({
        id: "writing-1",
        type: "writing",
        label: "Escritura 1",
        status: "available",
      });
    }

    nodes.push({
      id: "reading-1",
      type: "reading",
      label: "Lectura 1",
      status: "locked",
    });

    return nodes;
  }, [kanjis, completedActivities, level]);

  const connections = useMemo(
    () => generateConnections(nodeDefinitions),
    [nodeDefinitions],
  );

  const { nodes, edges } = useMemo(
    () => createCustomGraph(nodeDefinitions, connections),
    [nodeDefinitions, connections],
  );

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-content-tertiary">
        Cargando kanji…
      </div>
    );
  }

  return <LearningGraph initialNodes={nodes} initialEdges={edges} />;
}
