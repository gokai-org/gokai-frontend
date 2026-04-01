"use client";

import type { LessonMode, LessonResolved } from "../types";
import type { Kanji } from "@/features/kanji/types";
import KanjiLesson from "./lesson-renderers/KanjiLesson";
import GrammarLesson from "./lesson-renderers/GrammarLesson";
import SubthemeLesson from "./lesson-renderers/SubthemeLesson";

export default function LessonShell({
  lesson,
  mode,
  kanjiCtaDisabled = false,
  kanjiCtaDisabledReason,
  onWritingStart,
}: {
  lesson: LessonResolved;
  mode: LessonMode;
  kanjiCtaDisabled?: boolean;
  kanjiCtaDisabledReason?: string;
  onWritingStart?: (kanji: Kanji) => void;
}) {
  switch (lesson.kind) {
    case "kanji":
      return (
        <KanjiLesson
          data={lesson}
          mode={mode}
          ctaDisabled={kanjiCtaDisabled}
          ctaDisabledReason={kanjiCtaDisabledReason}
          onWritingStart={onWritingStart}
        />
      );
    case "grammar":
      return <GrammarLesson data={lesson} mode={mode} />;
    case "subtheme":
      return <SubthemeLesson data={lesson} mode={mode} />;
  }
}
