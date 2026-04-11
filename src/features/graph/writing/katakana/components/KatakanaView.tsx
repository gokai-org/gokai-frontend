"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { NodeTypes, EdgeTypes } from "reactflow";
import { WritingBoardView } from "../../shared/components/WritingBoardView";
import type { WritingBoardProgress } from "../../shared/types";
import WritingBoardEdge from "../../shared/components/WritingBoardEdge";
import KatakanaBoardNode from "./KatakanaBoardNode";
import { useKatakanaBoard } from "../hooks/useKatakanaBoard";
import LessonDrawer from "@/features/lessons/components/LessonDrawer";
import { KanaQuizModal } from "@/features/kana/components/quiz";
import type { KanaQuizType } from "@/features/kana/types/quiz";
import { useSidebar } from "@/shared/components/SidebarContext";
import { useMasteredModules } from "@/features/mastery/components/MasteredModulesProvider";
import { dispatchMasteryCelebrationRequest } from "@/features/mastery/utils/masteryProgressSync";

const NODE_TYPES: NodeTypes = { "writing-node": KatakanaBoardNode };
const EDGE_TYPES: EdgeTypes = { "writing-edge": WritingBoardEdge };

const GRAPH_USER_ID = "user123";

export default function KatakanaView() {
  const { items, summary, loading, error, reload, userPoints } = useKatakanaBoard();
  const { setHidden } = useSidebar();
  const mastered = useMasteredModules();

  const [manualSelectedId, setManualSelectedId] = useState<string | null>(null);
  const [detailNodeId, setDetailNodeId] = useState<string | null>(null);
  const [quizItem, setQuizItem] = useState<{
    id: string;
    label: string;
    quizType?: KanaQuizType;
  } | null>(
    null,
  );
  const wasMasteredBeforeQuizRef = useRef(false);

  const hasUnlockedNodes = useMemo(
    () => items.some((item) => item.status !== "locked"),
    [items],
  );

  const selectedId = useMemo(() => {
    if (detailNodeId && items.some((item) => item.id === detailNodeId)) {
      return detailNodeId;
    }

    if (
      manualSelectedId &&
      items.some((item) => item.id === manualSelectedId)
    ) {
      return manualSelectedId;
    }

    return (
      [...items].reverse().find((item) => item.status !== "locked")?.id ??
      items[0]?.id ??
      null
    );
  }, [detailNodeId, items, manualSelectedId]);

  const forcedInitialNodeId = !hasUnlockedNodes
    ? (items[0]?.id ?? null)
    : selectedId;

  const forcedFocusedNodeId = detailNodeId ?? (!hasUnlockedNodes
    ? (items[0]?.id ?? null)
    : null);

  const selectedProgress = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  const handleNodeAction = useCallback((item: WritingBoardProgress) => {
    setManualSelectedId(item.id);
    setDetailNodeId(item.id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setDetailNodeId(null);
  }, []);

  const handleQuizStart = useCallback(
    (entity: { id: string; symbol: string }, quizType?: KanaQuizType) => {
      wasMasteredBeforeQuizRef.current = mastered.has("katakana");
      setDetailNodeId(null);
      setQuizItem({ id: entity.id, label: entity.symbol, quizType });
    },
    [mastered],
  );

  const handleQuizEnd = useCallback(() => {
    const becameMastered =
      !wasMasteredBeforeQuizRef.current && mastered.has("katakana");

    setQuizItem(null);
    if (becameMastered) {
      dispatchMasteryCelebrationRequest({ moduleId: "katakana" });
    }
    void reload();
  }, [mastered, reload]);

  useEffect(() => {
    setHidden(detailNodeId !== null);
    return () => {
      setHidden(false);
    };
  }, [detailNodeId, setHidden]);

  return (
    <WritingBoardView
      items={items}
      summary={summary}
      scriptType="katakana"
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      loading={loading}
      error={error}
      onNodeAction={handleNodeAction}
      quizActive={quizItem !== null}
      drawerOpen={detailNodeId !== null}
      initialNodeId={forcedInitialNodeId}
      focusedNodeId={forcedFocusedNodeId}
      masteryModuleId="katakana"
      masteryPoints={userPoints}
    >
      <LessonDrawer
        open={detailNodeId !== null}
        onClose={handleCloseDetail}
        nodeId={detailNodeId}
        mode="writing"
        userId={GRAPH_USER_ID}
        kanaType="katakana"
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
          kanaType="katakana"
          quizType={quizItem.quizType}
          onClose={handleQuizEnd}
        />
      )}
    </WritingBoardView>
  );
}