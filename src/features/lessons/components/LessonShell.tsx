"use client";

import type { LessonMode, LessonResolved } from "../types";
import KanjiLesson from "./lesson-renderers/KanjiLesson";
import GrammarLesson from "./lesson-renderers/GrammarLesson";
import SubthemeLesson from "./lesson-renderers/SubthemeLesson";

export default function LessonShell({
  lesson,
  mode,
}: {
  lesson: LessonResolved;
  mode: LessonMode;
}) {
  switch (lesson.kind) {
    case "kanji":
      return <KanjiLesson data={lesson} mode={mode} />;
    case "grammar":
      return <GrammarLesson data={lesson} mode={mode} />;
    case "subtheme":
      return <SubthemeLesson data={lesson} mode={mode} />;
  }
}
