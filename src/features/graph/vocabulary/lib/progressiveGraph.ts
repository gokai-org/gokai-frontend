import type { NodeStatus } from "@/features/graph/lib/graphTypes";

export type ProgressiveNodeLike = {
  id: string;
  status: NodeStatus;
  order?: number | null;
  selectedAt?: string | null;
  createdAt?: string | null;
  unlockedAt?: string | null;
};

export type ProgressiveConnection = {
  from: string;
  to: string;
  completed?: boolean;
};

function getTime(value?: string | null) {
  if (!value) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : Number.MAX_SAFE_INTEGER;
}

export function compareProgressiveNodes(
  a: ProgressiveNodeLike,
  b: ProgressiveNodeLike,
) {
  const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
  const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

  if (orderA !== orderB) {
    return orderA - orderB;
  }

  const timeA = Math.min(
    getTime(a.unlockedAt),
    getTime(a.selectedAt),
    getTime(a.createdAt),
  );
  const timeB = Math.min(
    getTime(b.unlockedAt),
    getTime(b.selectedAt),
    getTime(b.createdAt),
  );

  if (timeA !== timeB) {
    return timeA - timeB;
  }

  return a.id.localeCompare(b.id, "es", { sensitivity: "base" });
}

export function buildProgressiveConnections<T extends ProgressiveNodeLike>(
  nodes: T[],
) {
  const routeNodes = nodes
    .filter((node) => node.status !== "locked")
    .sort(compareProgressiveNodes);

  return routeNodes.slice(0, -1).map<ProgressiveConnection>((node, index) => {
    const nextNode = routeNodes[index + 1];

    return {
      from: node.id,
      to: nextNode.id,
      completed: node.status === "completed" && nextNode.status === "completed",
    };
  });
}