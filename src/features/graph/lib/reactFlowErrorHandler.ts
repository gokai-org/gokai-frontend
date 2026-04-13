import type { OnError } from "reactflow";

export const handleReactFlowError: OnError = (id, message) => {
  if (id === "002") {
    return;
  }

  console.warn(`[React Flow]: ${message}`);
};