import type { ReviewItem } from "@/features/reviews/types";

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => start + index);

export const KAZU_SVG_SOURCE = "/logos/pet_kazu.svg";
export const KAZU_EXPECTED_PATH_COUNT = 66;

export type KazuLessonSegmentId = "writing" | "speaking" | "grammar" | "listening";

export const KAZU_LESSON_SEGMENTS: Record<
  KazuLessonSegmentId,
  {
    reviewType: ReviewItem["type"];
    guideColor: `#${string}`;
    pathIndexes: number[];
  }
> = {
  writing: {
    reviewType: "kanji",
    guideColor: "#993331",
    pathIndexes: range(0, 10),
  },
  grammar: {
    reviewType: "grammar",
    guideColor: "#F9F9F9",
    pathIndexes: range(11, 26),
  },
  listening: {
    reviewType: "listening",
    guideColor: "#1C1C1C",
    pathIndexes: range(27, 30),
  },
  speaking: {
    reviewType: "speaking",
    guideColor: "#F5D076",
    pathIndexes: range(31, 65),
  },
};

export const KAZU_REVIEW_TYPE_PATHS: Record<ReviewItem["type"], number[]> = {
  kanji: KAZU_LESSON_SEGMENTS.writing.pathIndexes,
  grammar: KAZU_LESSON_SEGMENTS.grammar.pathIndexes,
  listening: KAZU_LESSON_SEGMENTS.listening.pathIndexes,
  speaking: KAZU_LESSON_SEGMENTS.speaking.pathIndexes,
};

export const KAZU_PATH_REVIEW_TYPE_BY_INDEX = new Map<number, ReviewItem["type"]>(
  Object.entries(KAZU_REVIEW_TYPE_PATHS).flatMap(([reviewType, indexes]) =>
    indexes.map((index) => [index, reviewType as ReviewItem["type"]] as const),
  ),
);