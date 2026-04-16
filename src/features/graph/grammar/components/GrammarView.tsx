"use client";

import { GrammarBoard } from "./board";
import { useGrammarBoard } from "../hooks/useGrammarBoard";

export default function GrammarView() {
  const {
    board,
    status,
    handleSelectLesson,
  } = useGrammarBoard();

  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">
      <GrammarBoard
        board={board}
        status={status}
        onSelectLesson={handleSelectLesson}
      />
    </div>
  );
}