"use client";

import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import KatakanaBoardNode from "./KatakanaBoardNode";
import { useKatakanaBoard } from "../hooks/useKatakanaBoard";

const NODE_TYPES: NodeTypes = { "writing-node": KatakanaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

export default function KatakanaView() {
  const { items, summary, loading, error } = useKatakanaBoard();

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="katakana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
    />
  );
}
