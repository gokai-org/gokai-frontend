"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser } from "@/features/auth";
import { listKanaCatalog, getKanaStrokes } from "@/features/kana/api/kanaApi";
import { getMockKanaStrokes } from "@/features/kana/mock/mockStrokeData";
import type { DrawnStroke as KanaDrawnStroke } from "@/features/kana/components/KanaWritingCanvas";
import {
  buildKanaCatalogState,
  getKanaSymbolGuideInfo,
  type KanaSymbolGuideInfo,
} from "@/features/kana/utils/kanaSymbolGuide";
import {
  getFeedbackColor as getKanaFeedbackColor,
  getFeedbackLabel as getKanaFeedbackLabel,
  validateStroke as validateKanaStroke,
} from "@/features/kana/lib/strokeValidation";
import { listKanjis, getKanjiLessonResults, getKanjiProgress, getKanjiStrokes } from "@/features/kanji/api/kanjiApi";
import { getMockKanjiStrokes } from "@/features/kanji/mock/mockStrokeData";
import {
  getFeedbackColor as getKanjiFeedbackColor,
  getFeedbackLabel as getKanjiFeedbackLabel,
  validateStroke as validateKanjiStroke,
} from "@/features/kanji/lib/strokeValidation";
import { resolveKanjiUnlockState } from "@/features/kanji/lib/kanjiUnlockState";
import type { ChatMessage } from "@/features/chatbot/types";
import {
  extractJapaneseCharacters,
  type JapaneseCharacterType,
} from "@/features/chatbot/utils/writingCharacters";
import { resolveWritingAccentColor } from "@/features/chatbot/utils/writingPalette";

type PracticeStatus = "available" | "locked" | "upcoming";
type PracticePhase = "guide" | "practice";
type PracticeStroke = KanaDrawnStroke;

type StrokePayload = {
  viewBox: string;
  strokes: string[];
};

export type ChatWritingTarget = {
  id: string;
  symbol: string;
  type: JapaneseCharacterType;
  status: PracticeStatus;
  title: string;
  badge: string;
  helper: string;
  catalogId?: string;
  accentColor?: string;
  symbolGuide?: KanaSymbolGuideInfo;
};

export type ChatWritingNotebookEntry = {
  id: string;
  targetId: string;
  symbol: string;
  type: JapaneseCharacterType;
  viewBox: string;
  strokes: PracticeStroke[];
  attemptNumber: number;
};

type PracticeFeedback = {
  label: string;
  colorClassName: string;
};

function getScriptLabel(type: JapaneseCharacterType) {
  switch (type) {
    case "hiragana":
      return "Hiragana";
    case "katakana":
      return "Katakana";
    case "kanji":
      return "Kanji";
    default:
      return "Caracter";
  }
}

function getAccentColor(type: JapaneseCharacterType) {
  switch (type) {
    case "hiragana":
      return resolveWritingAccentColor("hiragana");
    case "katakana":
      return resolveWritingAccentColor("katakana");
    case "kanji":
      return resolveWritingAccentColor("kanji");
    default:
      return undefined;
  }
}

function findNextAvailableTarget(
  targets: ChatWritingTarget[],
  currentId: string,
) {
  const currentIndex = targets.findIndex((target) => target.id === currentId);
  const nextTarget = targets
    .slice(currentIndex + 1)
    .find((target) => target.status === "available");

  if (nextTarget) {
    return nextTarget;
  }

  return targets.find(
    (target) => target.status === "available" && target.id !== currentId,
  ) ?? null;
}

function getLockedKanaHelper(type: JapaneseCharacterType) {
  if (type === "hiragana") {
    return "Aun no has desbloqueado este hiragana. Cuando avances en la tabla fonetica podras practicar su trazado desde el chat.";
  }

  if (type === "katakana") {
    return "Aun no has desbloqueado este katakana. Cuando avances en la tabla fonetica podras practicar su trazado desde el chat.";
  }

  return "Este simbolo aun no esta disponible para tu practica actual.";
}

export function useChatWritingPractice(message: ChatMessage | null) {
  const [targets, setTargets] = useState<ChatWritingTarget[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [targetsLoading, setTargetsLoading] = useState(false);
  const [strokeLoading, setStrokeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [strokePayload, setStrokePayload] = useState<StrokePayload | null>(null);
  const [phase, setPhase] = useState<PracticePhase>("guide");
  const [activeStrokeIndex, setActiveStrokeIndex] = useState(0);
  const [flashError, setFlashError] = useState(false);
  const [feedback, setFeedback] = useState<PracticeFeedback | null>(null);
  const [currentAttempt, setCurrentAttempt] = useState<PracticeStroke[]>([]);
  const [notebookEntries, setNotebookEntries] = useState<
    ChatWritingNotebookEntry[]
  >([]);
  const [completionSequence, setCompletionSequence] = useState(0);

  const characters = useMemo(
    () => extractJapaneseCharacters(message?.content ?? "", { unique: true }),
    [message?.content],
  );

  const activeTarget = useMemo(
    () => targets.find((target) => target.id === selectedId) ?? targets[0] ?? null,
    [selectedId, targets],
  );

  const availableTargets = useMemo(
    () => targets.filter((target) => target.status === "available"),
    [targets],
  );

  const completedTargetIds = useMemo(
    () => new Set(notebookEntries.map((entry) => entry.targetId)),
    [notebookEntries],
  );

  const hasCompletedMessage = useMemo(
    () =>
      availableTargets.length > 0 &&
      availableTargets.every((target) => completedTargetIds.has(target.id)),
    [availableTargets, completedTargetIds],
  );

  useEffect(() => {
    let cancelled = false;

    setTargets([]);
    setSelectedId(null);
    setNotebookEntries([]);
    setStrokePayload(null);
    setCompletionSequence(0);
    setPhase("guide");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
    setError(null);

    if (!message || characters.length === 0) {
      setTargetsLoading(false);
      return;
    }

    async function loadTargets() {
      setTargetsLoading(true);

      try {
        const [currentUser, kanaCatalog, kanjiList, kanjiProgress, kanjiResults] =
          await Promise.all([
            getCurrentUser().catch(() => null),
            listKanaCatalog().catch(() => null),
            listKanjis().catch(() => []),
            getKanjiProgress().catch(() => null),
            getKanjiLessonResults({ limit: 100 }).catch(() => null),
          ]);

        if (cancelled) {
          return;
        }

        const hiraganaCatalog = kanaCatalog?.hiragana ?? [];
        const katakanaCatalog = kanaCatalog?.katakana ?? [];
        const kanaGuideCatalog = buildKanaCatalogState(kanaCatalog);
        const hiraganaBySymbol = new Map(
          hiraganaCatalog.map((kana) => [kana.symbol, kana]),
        );
        const katakanaBySymbol = new Map(
          katakanaCatalog.map((kana) => [kana.symbol, kana]),
        );
        const kanjiBySymbol = new Map(kanjiList.map((kanji) => [kanji.symbol, kanji]));
        const userKanaPoints =
          currentUser && typeof currentUser.kanaPoints === "number"
            ? currentUser.kanaPoints
            : 0;
        const kanjiUnlockState = resolveKanjiUnlockState({
          kanjis: kanjiList,
          results: kanjiResults?.results ?? [],
          progress: kanjiProgress,
          userPoints:
            currentUser && typeof currentUser.points === "number"
              ? currentUser.points
              : 0,
        });

        const nextTargets = characters.map((character, index) => {
          if (character.type === "hiragana" || character.type === "katakana") {
            const symbolMap =
              character.type === "hiragana" ? hiraganaBySymbol : katakanaBySymbol;
            const kana = symbolMap.get(character.symbol);
            const symbolGuide = getKanaSymbolGuideInfo(
              character.symbol,
              kanaGuideCatalog,
            );

            if (!kana) {
              return {
                id: `${character.type}:${character.symbol}:${index}`,
                symbol: character.symbol,
                type: character.type,
                status: "upcoming",
                title: `${character.symbol} · ${getScriptLabel(character.type)}`,
                badge: "Proximo",
                helper:
                  "Este caracter todavia no tiene una ficha disponible para practicar desde el chat.",
                accentColor: getAccentColor(character.type),
                symbolGuide,
              } satisfies ChatWritingTarget;
            }

            const isAvailable = userKanaPoints >= kana.pointsToUnlock;

            return {
              id: `${character.type}:${kana.id}:${index}`,
              symbol: character.symbol,
              type: character.type,
              status: isAvailable ? "available" : "locked",
              title: `${character.symbol} · ${getScriptLabel(character.type)}`,
              badge: isAvailable ? "Listo" : "Bloqueado",
              helper: isAvailable
                ? `Practica este ${getScriptLabel(character.type).toLowerCase()} con el mismo flujo de escritura del quiz.`
                : getLockedKanaHelper(character.type),
              catalogId: kana.id,
              accentColor: getAccentColor(character.type),
              symbolGuide,
            } satisfies ChatWritingTarget;
          }

          const kanji = kanjiBySymbol.get(character.symbol);
          if (!kanji) {
            return {
              id: `kanji:${character.symbol}:${index}`,
              symbol: character.symbol,
              type: "kanji",
              status: "upcoming",
              title: `${character.symbol} · Kanji`,
              badge: "Proximo",
              helper:
                "Este kanji aparecio en el mensaje, pero todavia no tiene una ficha disponible para practicar desde el chat.",
              accentColor: getAccentColor("kanji"),
            } satisfies ChatWritingTarget;
          }

          const isAvailable = kanjiUnlockState.unlockedIds.has(kanji.id);

          return {
            id: `kanji:${kanji.id}:${index}`,
            symbol: character.symbol,
            type: "kanji",
            status: isAvailable ? "available" : "locked",
            title: `${character.symbol} · Kanji`,
            badge: isAvailable ? "Listo" : "Bloqueado",
            helper: isAvailable
              ? "Practica este kanji con su orden de trazos igual que en los ejercicios de escritura."
              : "Este kanji todavia no esta disponible para tu practica actual.",
            catalogId: kanji.id,
            accentColor: getAccentColor("kanji"),
          } satisfies ChatWritingTarget;
        });

        setTargets(nextTargets);
        setSelectedId(
          nextTargets.find((target) => target.status === "available")?.id ??
            nextTargets[0]?.id ??
            null,
        );
      } catch {
        if (!cancelled) {
          setError(
            "No se pudieron preparar las letras del mensaje para la practica de escritura.",
          );
        }
      } finally {
        if (!cancelled) {
          setTargetsLoading(false);
        }
      }
    }

    void loadTargets();

    return () => {
      cancelled = true;
    };
  }, [characters, message]);

  useEffect(() => {
    let cancelled = false;

    setPhase("guide");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
    setStrokePayload(null);

    if (!activeTarget || activeTarget.status !== "available") {
      setStrokeLoading(false);
      return;
    }

    async function loadStrokes() {
      setStrokeLoading(true);
      setError(null);

      try {
        if (
          activeTarget.type === "hiragana" ||
          activeTarget.type === "katakana"
        ) {
          const strokeData = activeTarget.catalogId
            ? await getKanaStrokes(activeTarget.catalogId).catch(() =>
                getMockKanaStrokes(`mock-${activeTarget.symbol}`, activeTarget.symbol),
              )
            : getMockKanaStrokes(`mock-${activeTarget.symbol}`, activeTarget.symbol);

          if (!strokeData) {
            throw new Error("Sin datos de trazo para el simbolo.");
          }

          if (!cancelled) {
            setStrokePayload({
              viewBox: strokeData.viewBox,
              strokes: strokeData.strokes,
            });
          }
        } else {
          const strokeData = activeTarget.catalogId
            ? await getKanjiStrokes(activeTarget.catalogId).catch(() =>
                getMockKanjiStrokes(`mock-${activeTarget.symbol}`, activeTarget.symbol),
              )
            : getMockKanjiStrokes(`mock-${activeTarget.symbol}`, activeTarget.symbol);

          if (!strokeData) {
            throw new Error("Sin datos de trazo para el kanji.");
          }

          if (!cancelled) {
            setStrokePayload({
              viewBox: strokeData.viewBox,
              strokes: strokeData.strokes,
            });
          }
        }
      } catch {
        if (!cancelled) {
          setError(
            "No se pudieron cargar los trazos de este simbolo. Intenta con otro mensaje o mas tarde.",
          );
        }
      } finally {
        if (!cancelled) {
          setStrokeLoading(false);
        }
      }
    }

    void loadStrokes();

    return () => {
      cancelled = true;
    };
  }, [activeTarget]);

  const selectTarget = useCallback((targetId: string) => {
    setSelectedId(targetId);
  }, []);

  const startPractice = useCallback(() => {
    setPhase("practice");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
  }, []);

  const resetCurrentPractice = useCallback(() => {
    setPhase("practice");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
  }, []);

  const goBackToGuide = useCallback(() => {
    setPhase("guide");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
  }, []);

  const clearNotebook = useCallback(() => {
    setNotebookEntries([]);
    setCompletionSequence(0);
  }, []);

  const restartMessagePractice = useCallback(() => {
    setNotebookEntries([]);
    setCompletionSequence(0);
    setSelectedId(availableTargets[0]?.id ?? targets[0]?.id ?? null);
    setPhase("guide");
    setActiveStrokeIndex(0);
    setCurrentAttempt([]);
    setFeedback(null);
    setFlashError(false);
  }, [availableTargets, targets]);

  const handleStrokeDrawn = useCallback(
    (stroke: PracticeStroke) => {
      if (!activeTarget || !strokePayload) {
        return;
      }

      const referenceStroke = strokePayload.strokes[activeStrokeIndex];
      if (!referenceStroke) {
        return;
      }

      const validation =
        activeTarget.type === "kanji"
          ? validateKanjiStroke(stroke.points, referenceStroke, strokePayload.viewBox)
          : validateKanaStroke(stroke.points, referenceStroke, strokePayload.viewBox);
      const nextFeedback = {
        label:
          activeTarget.type === "kanji"
            ? getKanjiFeedbackLabel(validation.feedback)
            : getKanaFeedbackLabel(validation.feedback),
        colorClassName:
          activeTarget.type === "kanji"
            ? getKanjiFeedbackColor(validation.feedback)
            : getKanaFeedbackColor(validation.feedback),
      } satisfies PracticeFeedback;
      const nextAttempt = [...currentAttempt, stroke];
      const nextStrokeIndex = activeStrokeIndex + 1;

      setFeedback(nextFeedback);
      setCurrentAttempt(nextAttempt);
      setFlashError(
        validation.feedback === "poor" || validation.feedback === "miss",
      );

      if (nextStrokeIndex >= strokePayload.strokes.length) {
        setNotebookEntries((previous) => [
          {
            id: `${activeTarget.id}:${Date.now()}`,
            targetId: activeTarget.id,
            symbol: activeTarget.symbol,
            type: activeTarget.type,
            viewBox: strokePayload.viewBox,
            strokes: nextAttempt,
            attemptNumber:
              previous.filter((entry) => entry.targetId === activeTarget.id).length + 1,
          },
          ...previous,
        ]);

        const nextTarget = findNextAvailableTarget(targets, activeTarget.id);
        if (nextTarget) {
          setSelectedId(nextTarget.id);
          return;
        }

        setCompletionSequence((previous) => previous + 1);
        setPhase("guide");
        setActiveStrokeIndex(0);
        setCurrentAttempt([]);
        return;
      }

      setActiveStrokeIndex(nextStrokeIndex);
    },
    [activeStrokeIndex, activeTarget, currentAttempt, strokePayload, targets],
  );

  return {
    targets,
    activeTarget,
    targetsLoading,
    strokeLoading,
    error,
    phase,
    strokePayload,
    activeStrokeIndex,
    flashError,
    feedback,
    notebookEntries,
    availableTargets,
    completedTargetIds,
    hasCompletedMessage,
    completionSequence,
    selectTarget,
    startPractice,
    resetCurrentPractice,
    goBackToGuide,
    clearNotebook,
    restartMessagePractice,
    handleStrokeDrawn,
  };
}