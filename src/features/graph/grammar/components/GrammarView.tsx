"use client";

import { AnimatePresence } from "framer-motion";
import { GrammarBoard } from "./board";
import GrammarLessonModal from "./lesson/GrammarLessonModal";
import GrammarExamModal from "./lesson/exam/GrammarExamModal";
import { useGrammarBoard } from "../hooks/useGrammarBoard";

export default function GrammarView() {
  const {
    board,
    status,
    selectedId,
    examLessonId,
    handleSelectLesson,
    handleCloseLesson,
    handleOpenExam,
    handleCloseExam,
  } = useGrammarBoard();

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <GrammarBoard
        board={board}
        status={status}
        onSelectLesson={handleSelectLesson}
      />

      {selectedId && (
        <AnimatePresence>
          <GrammarLessonModal
            key={selectedId}
            lessonId={selectedId}
            onClose={handleCloseLesson}
            onExamOpen={handleOpenExam}
          />
        </AnimatePresence>
      )}

      <AnimatePresence>
        {examLessonId && (
          <GrammarExamModal
            key={`exam-${examLessonId}`}
            lessonId={examLessonId}
            onClose={handleCloseExam}
          />
        )}
      </AnimatePresence>
    </div>
  );
}