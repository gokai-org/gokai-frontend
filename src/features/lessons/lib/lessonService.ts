import type { LessonMode, LessonResolved } from "../types";
import { mockLessonsByNodeId } from "../data/mockLessons";
import { getKanji } from "@/features/kanji/api/kanjiApi";
import { getKana } from "@/features/kana/api/kanaApi";

export async function getLessonsForNode(params: {
  nodeId: string;
  mode: LessonMode;
  userId: string;
  entityId?: string | null;
  entityKind?: "kanji" | "kana" | "subtheme" | "grammar" | null;
}): Promise<LessonResolved[]> {
  const { nodeId, mode, entityId, entityKind } = params;

  // Si tenemos entityId + entityKind, construimos la lección con datos reales del backend
  if (entityKind === "kana" && entityId) {
    try {
      const kana = await getKana(entityId);
      const typeLabel = kana.kanaType === "hiragana" ? "Hiragana" : "Katakana";
      return [
        {
          kind: "kana" as const,
          lesson: {
            id: `lesson-kana-${entityId}`,
            description: `Aprende el ${typeLabel} ${kana.symbol} (${kana.romaji ?? ""}).`,
            lessonType: "kana" as const,
            entityId,
          },
          kana,
        },
      ];
    } catch {
      return mockLessonsByNodeId[nodeId] ?? [];
    }
  }

  if (entityKind === "kanji" && entityId) {
    try {
      const kanji = await getKanji(entityId);
      return [
        {
          kind: "kanji",
          lesson: {
            id: `lesson-${entityKind}-${entityId}`,
            description: `Aprende el orden de trazos del kanji ${kanji.symbol}.`,
            lessonType: "kanji",
            entityId,
          },
          kanji,
        },
      ];
    } catch {
      // Si falla el backend, caer a mocks
      return mockLessonsByNodeId[nodeId] ?? [];
    }
  }

  // Para otros tipos de entidad, intentar endpoint de lecciones o caer a mocks
  try {
    const res = await fetch(
      `/api/content/lessons?nodeId=${encodeURIComponent(nodeId)}&mode=${mode}`,
      { cache: "no-store" },
    );
    if (res.ok) {
      return (await res.json()) as LessonResolved[];
    }
  } catch {
    // silenciar error de red
  }

  // Fallback a mocks
  return mockLessonsByNodeId[nodeId] ?? [];
}
