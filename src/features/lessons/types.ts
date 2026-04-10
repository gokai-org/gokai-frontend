import type { Kanji } from "@/features/kanji/types";
import type { Kana } from "@/features/kana/types";

export type LessonType = "kanji" | "kana" | "subtheme" | "grammar";
export type LessonMode = "writing" | "listening" | "reading" | "speaking";

export type Lesson = {
  id: string;
  description: string;
  lessonType: LessonType;
  entityId: string;
};

export type GrammarLesson = {
  id: string;
  title: string;
  description: string | null;
  pointsToUnlock: number | null;
  useCases: string | null;
  examples: string | null;
};

export type Theme = {
  id: string;
  meaning: string | null;
  kanji: string;
  kana: string;
  released: boolean;
};

export type Subtheme = {
  id: string;
  meaning: string;
  themeId: string;
  kanji: string;
  kana: string;
};

export type SubthemeWithTheme = Subtheme & { theme: Theme };

export type LessonResolved =
  | { lesson: Lesson; kind: "kanji"; kanji: Kanji }
  | { lesson: Lesson; kind: "kana"; kana: Kana }
  | { lesson: Lesson; kind: "grammar"; grammar: GrammarLesson }
  | { lesson: Lesson; kind: "subtheme"; subtheme: SubthemeWithTheme };
