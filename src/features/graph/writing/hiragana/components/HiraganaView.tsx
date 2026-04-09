"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import type { WritingBoardProgress } from "../../shared/types";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import HiraganaBoardNode from "./HiraganaBoardNode";
import { useHiraganaBoard } from "../hooks/useHiraganaBoard";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import { useSidebar } from "@/shared/components/SidebarContext";

const NODE_TYPES: NodeTypes = { "writing-node": HiraganaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

const GRAPH_USER_ID = "user123";

export default function HiraganaView() {
  const { items, summary, loading, error, reload } = useHiraganaBoard();
  const { setHidden } = useSidebar();
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<{ id: string; label: string } | null>(null);

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === detailNodeId) ?? null,
    [detailNodeId, items],
  );

  const handleNodeAction = useCallback((item: WritingBoardProgress) => {
    setDetailNodeId(item.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const handleQuizStart = useCallback(
    (entity: { id: string; symbol: string }) => {
      setDetailNodeId(null);
      setQuizItem({ id: entity.id, label: entity.symbol });
    },
    [],
  );

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  const handleQuizEnd = useCallback(() => {
    setQuizItem(null);
    void reload();
  }, [reload]);

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="hiragana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
      onNodeAction={handleNodeAction}
      quizActive={quizItem !== null}
    >
      <LessonDrawer
        open={detailNodeId !== null}
        onClose={handleCloseDetail}
        nodeId={detailNodeId}
        mode="writing"
        userId={GRAPH_USER_ID}
        entityId={selectedProgress?.id ?? null}
        entityKind={selectedProgress ? "kana" : null}
        kanjiCtaDisabled={selectedProgress?.status === "locked"}
        kanjiCtaDisabledReason={
          selectedProgress?.status === "locked"
            ? "Necesitas mas puntos para desbloquear este kana."
            : undefined
        }
        onQuizStart={handleQuizStart}
      />

      {quizItem && (
        <KanaQuizModal
          kanaId={quizItem.id}
          label={quizItem.label}
          kanaType="hiragana"
          onClose={handleQuizEnd}
        />
      )}
    </WritingBoardView>
  );
}
