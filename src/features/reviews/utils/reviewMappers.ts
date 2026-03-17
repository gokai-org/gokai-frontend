import type { Kanji } from "@/features/kanji/types";
import type { ReviewItem } from "../types";
import { MOCK_GRAMMAR, MOCK_LISTENING, MOCK_SPEAKING } from "./reviewMocks";

export function buildReviewItems(kanjis: Kanji[]): ReviewItem[] {
  const items: ReviewItem[] = [];

  if (kanjis.length > 0) {
    items.push({
      id: kanjis[0].id,
      type: "kanji",
      lastPracticed: "2h",
      kanji: kanjis[0],
    });
  }

  items.push(MOCK_GRAMMAR, MOCK_LISTENING, MOCK_SPEAKING);
  return items;
}
