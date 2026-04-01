"use client";

import type { LessonMode, LessonResolved } from "../types";
import KanjiLesson from "./lesson-renderers/KanjiLesson";
import GrammarLesson from "./lesson-renderers/GrammarLesson";
import SubthemeLesson from "./lesson-renderers/SubthemeLesson";

export default function LessonShell({
  lesson,
  mode,
  kanjiCtaDisabled = false,
  kanjiCtaDisabledReason,
}: {
  lesson: LessonResolved;
  mode: LessonMode;
  kanjiCtaDisabled?: boolean;
  kanjiCtaDisabledReason?: string;
}) {
  switch (lesson.kind) {
    case "kanji":
      return (
        <KanjiLesson
          data={lesson}
          mode={mode}
          ctaDisabled={kanjiCtaDisabled}
          ctaDisabledReason={kanjiCtaDisabledReason}
        />
      );
    case "grammar":
      return <GrammarLesson data={lesson} mode={mode} />;
    case "subtheme":
      return <SubthemeLesson data={lesson} mode={mode} />;
  }
}
