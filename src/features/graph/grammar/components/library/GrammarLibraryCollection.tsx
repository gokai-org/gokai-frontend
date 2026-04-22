"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dispatchMasteryProgressSync } from "@/features/mastery/utils/masteryProgressSync";
import { useSidebar } from "@/shared/components/SidebarContext";
import { LibraryCategorySection } from "@/features/library/components/LibraryCategorySection";
import { SkeletonCard } from "@/shared/ui/Skeleton";
import { useToast } from "@/shared/ui/ToastProvider";
import { invalidateApiCache } from "@/shared/lib/api/client";
import { unlockGrammar } from "../../api/grammarApi";
import { GRAMMAR_BOARD_TOTAL } from "../../constants/grammarBoard";
import { useGrammarLesson } from "../../hooks/useGrammarLesson";
import { useGrammarLessons } from "../../hooks/useGrammarLessons";
import type { GrammarQuizCompletionResult } from "../../types";
import GrammarLessonModal from "../lesson/GrammarLessonModal";
import GrammarQuizModal from "../lesson/exam/GrammarQuizModal";
import { GrammarLibraryCard } from "./GrammarLibraryCard";

type GrammarLibraryStage = "grid" | "lesson" | "quiz";

export interface GrammarLibraryCollectionProps {
  favoriteIds?: ReadonlySet<string>;
  filterIds?: ReadonlySet<string>;
  onToggleFavorite?: (lessonId: string) => void;
  className?: string;
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message.replace(/^HTTP\s+\d+:\s*/i, "").trim();

  return message || fallback;
}

export function GrammarLibraryCollection({
  filterIds,
  className = "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6",
}: GrammarLibraryCollectionProps) {
  const {
    boardItems,
    status,
    error,
    refetch: refetchBoard,
    applyOptimisticUnlock,
    recentlyUnlockedIds,
    nextUnlockCandidate,
  } = useGrammarLessons();
  const autoUnlockedRef = useRef<Set<string>>(new Set());
  const { setHidden } = useSidebar();
  const toast = useToast();
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [stage, setStage] = useState<GrammarLibraryStage>("grid");
  const [unlockPending, setUnlockPending] = useState(false);
  const [unlockPendingLessonId, setUnlockPendingLessonId] = useState<string | null>(null);
  const { lesson, status: lessonStatus, error: lessonError, refetch } =
    useGrammarLesson(selectedLessonId);

  const lessons = useMemo(
    () =>
      filterIds
        ? boardItems.filter((item) => filterIds.has(item.id))
        : boardItems,
    [boardItems, filterIds],
  );

  useEffect(() => {
    if (stage === "lesson" || stage === "quiz") {
      setHidden(true);
    } else {
      setHidden(false);
    }

    return () => setHidden(false);
  }, [setHidden, stage]);

  const handleUnlockNextLesson = useCallback(
    async (lessonId: string) => {
      if (unlockPending) {
        return;
      }

      const targetLesson = boardItems.find((item) => item.id === lessonId);

      if (!targetLesson || !targetLesson.canUnlock) {
        return;
      }

      setUnlockPending(true);
      setUnlockPendingLessonId(lessonId);

      try {
        const response = await unlockGrammar(lessonId);
        dispatchMasteryProgressSync({ points: response.userPoints });
        applyOptimisticUnlock(lessonId);
        void refetchBoard();
      } catch (unlockError) {
        toast.error(
          getRequestErrorMessage(
            unlockError,
            "No se pudo desbloquear la lección.",
          ),
        );
      } finally {
        setUnlockPending(false);
        setUnlockPendingLessonId(null);
      }
    },
    [applyOptimisticUnlock, boardItems, refetchBoard, toast, unlockPending],
  );

  useEffect(() => {
    if (status !== "success") {
      return;
    }

    if (stage !== "grid") {
      return;
    }

    if (unlockPending) {
      return;
    }

    const candidate = nextUnlockCandidate;

    if (!candidate || !candidate.canUnlock) {
      return;
    }

    if ((candidate.pointsToUnlock ?? 0) > 0) {
      return;
    }

    if (autoUnlockedRef.current.has(candidate.id)) {
      return;
    }

    autoUnlockedRef.current.add(candidate.id);
    void handleUnlockNextLesson(candidate.id);
  }, [handleUnlockNextLesson, nextUnlockCandidate, stage, status, unlockPending]);

  const handleSelectLesson = useCallback(
    (lessonId: string) => {
      if (stage !== "grid") {
        return;
      }

      const targetLesson = boardItems.find((item) => item.id === lessonId);

      if (!targetLesson || targetLesson.status === "locked" || targetLesson.isMock) {
        return;
      }

      setSelectedLessonId(lessonId);
      setStage("lesson");
    },
    [boardItems, stage],
  );

  const handleCloseLesson = useCallback(() => {
    if (stage !== "lesson") {
      return;
    }

    setSelectedLessonId(null);
    setStage("grid");
  }, [stage]);

  const handleStartExam = useCallback(() => {
    if (stage !== "lesson" || !lesson?.content?.exam?.length) {
      return;
    }

    setStage("quiz");
  }, [lesson, stage]);

  const handleCloseQuiz = useCallback(() => {
    if (stage !== "quiz") {
      return;
    }

    setStage("lesson");
  }, [stage]);

  const handleQuizComplete = useCallback(
    (result: GrammarQuizCompletionResult) => {
      dispatchMasteryProgressSync({ points: result.userPoints });
      invalidateApiCache("/api/content/grammar/progress");
      void refetchBoard();
    },
    [refetchBoard],
  );

  if (status === "loading") {
    return (
      <div className={className}>
        {Array.from({ length: 12 }).map((_, index) => (
          <SkeletonCard key={`grammar-library-skeleton-${index}`} />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <LibraryCategorySection
        title="Colección de Grammar"
        countLabel={`${GRAMMAR_BOARD_TOTAL} lecciones`}
        emptyTitle="No se pudo cargar grammar"
        emptyDescription={error || "Ocurrió un error al cargar las lecciones."}
      >
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="max-w-md text-content-secondary">
            {error || "Ocurrió un error al cargar las lecciones."}
          </p>
          <button
            type="button"
            onClick={() => {
              void refetchBoard();
            }}
            className="mt-5 rounded-2xl bg-gradient-to-r from-accent to-accent-hover px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
          >
            Reintentar
          </button>
        </div>
      </LibraryCategorySection>
    );
  }

  return (
    <>
      <div className={className}>
        {lessons.map((item, index) => (
          item.isMock ? (
            <SkeletonCard
              key={`grammar-library-skeleton-${item.id}-${index}`}
              className="min-h-[190px]"
            />
          ) : (
            <GrammarLibraryCard
              key={item.id}
              lesson={item}
              index={index}
              unlockPending={unlockPendingLessonId === item.id}
              justUnlocked={recentlyUnlockedIds.has(item.id)}
              onSelect={handleSelectLesson}
              onPressUnlock={handleUnlockNextLesson}
            />
          )
        ))}
      </div>

      <AnimatePresence>
        {stage === "lesson" && selectedLessonId ? (
          <GrammarLessonModal
            lesson={lesson}
            status={lessonStatus}
            error={lessonError}
            onClose={handleCloseLesson}
            onRetry={() => {
              void refetch();
            }}
            onStartExam={handleStartExam}
          />
        ) : null}

        {stage === "quiz" && lesson ? (
          <GrammarQuizModal
            lesson={lesson}
            onClose={handleCloseQuiz}
            onComplete={handleQuizComplete}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

export default GrammarLibraryCollection;