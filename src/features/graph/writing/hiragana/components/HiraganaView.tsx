"use client";

import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import HiraganaBoardNode from "./HiraganaBoardNode";
import { useHiraganaBoard } from "../hooks/useHiraganaBoard";

const NODE_TYPES: NodeTypes = { "writing-node": HiraganaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

export default function HiraganaView() {
  const { items, summary, loading, error } = useHiraganaBoard();

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="hiragana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
    />
  );
}
