"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import type { WritingBoardProgress } from "../../shared/types";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import HiraganaBoardNode from "./HiraganaBoardNode";
import { useHiraganaBoard } from "../hooks/useHiraganaBoard";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import { useSidebar } from "@/shared/components/SidebarContext";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { dispatchMasteryCelebrationRequest } from "@/features/mastery/utils/masteryProgressSync";

const NODE_TYPES: NodeTypes = { "writing-node": HiraganaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

const GRAPH_USER_ID = "user123";

export default function HiraganaView() {
  const { items, summary, loading, error, reload, userPoints } = useHiraganaBoard();
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<{
    id: string;
    label: string;
    quizType?: KanaQuizType;
  } | null>(null);
  const wasMasteredBeforeQuizRef = useRef(false);

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
    (entity: { id: string; symbol: string }, quizType?: KanaQuizType) => {
      wasMasteredBeforeQuizRef.current = mastered.has("hiragana");
      setDetailNodeId(null);
      setQuizItem({ id: entity.id, label: entity.symbol, quizType });
    },
    [mastered],
  );

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  const handleQuizEnd = useCallback(() => {
    const becameMastered =
      !wasMasteredBeforeQuizRef.current && mastered.has("hiragana");

    setQuizItem(null);
    if (becameMastered) {
      dispatchMasteryCelebrationRequest({ moduleId: "hiragana" });
    }
    void reload();
  }, [mastered, reload]);

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
      drawerOpen={detailNodeId !== null}
      masteryModuleId="hiragana"
      masteryPoints={userPoints}
    >
      <LessonDrawer
        open={detailNodeId !== null}
        onClose={handleCloseDetail}
        nodeId={detailNodeId}
        mode="writing"
        userId={GRAPH_USER_ID}
        kanaType="hiragana"
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
          quizType={quizItem.quizType}
          onClose={handleQuizEnd}
        />
      )}
    </WritingBoardView>
  );
}
