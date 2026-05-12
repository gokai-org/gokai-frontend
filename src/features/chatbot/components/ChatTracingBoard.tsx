"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@/features/chatbot/types";
import { KanaWritingCanvas } from "@/features/kana/components/KanaWritingCanvas";
import { listKanaCatalog, getKanaStrokes } from "@/features/kana/api/kanaApi";
import type { KanaStrokeData } from "@/features/kana/types";
import {
  getMockKanaStrokes,
  hasMockKanaStrokes,
} from "@/features/kana/mock/mockStrokeData";
import { KanjiWritingCanvas } from "@/features/kanji/components/KanjiWritingCanvas";
import { getKanjiStrokes, listKanjis } from "@/features/kanji/api/kanjiApi";
import type { KanjiStrokeData } from "@/features/kanji/types";
import {
  getMockKanjiStrokes,
  hasMockStrokes,
} from "@/features/kanji/mock/mockStrokeData";

type TraceCharacterType = "hiragana" | "katakana" | "kanji";

type TraceCharacterTarget = {
  id: string;
  symbol: string;
  type: TraceCharacterType;
  label: string;
  note: string;
};

type TraceStrokePayload = {
  kind: TraceCharacterType;
  viewBox: string;
  strokes: string[];
};

const JAPANESE_CHARACTER_PATTERN = /[\u3041-\u3096\u30A1-\u30FA\u4E00-\u9FFF々〆ヶ]/gu;

function getCharacterLabel(type: TraceCharacterType) {
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

function getCharacterNote(type: TraceCharacterType) {
  switch (type) {
    case "hiragana":
      return "Repasa el trazo base y la fluidez del silabario.";
    case "katakana":
      return "Enfocate en lineas firmes y angulos mas marcados.";
    case "kanji":
      return "Usa el tablero para memorizar estructura y equilibrio visual.";
    default:
      return "Practica el movimiento y repite el simbolo varias veces.";
  }
}

function useCanvasSize(max: number, padding = 72, min = 220) {
  const [size, setSize] = useState(max);

  useEffect(() => {
    const update = () =>
      setSize(Math.max(min, Math.min(max, window.innerWidth - padding)));

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [max, min, padding]);

  return size;
}

function extractJapaneseCharacters(messages: ChatMessage[]) {
  const seen = new Set<string>();
  const extracted: string[] = [];

  for (let messageIndex = messages.length - 1; messageIndex >= 0; messageIndex -= 1) {
    const matches = messages[messageIndex]?.content.match(JAPANESE_CHARACTER_PATTERN);
    if (!matches) {
      continue;
    }

    for (const symbol of matches) {
      if (seen.has(symbol)) {
        continue;
      }

      seen.add(symbol);
      extracted.push(symbol);
    }
  }

  return extracted;
}

interface ChatTracingBoardProps {
  messages: ChatMessage[];
}

export function ChatTracingBoard({ messages }: ChatTracingBoardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [strokePayload, setStrokePayload] = useState<TraceStrokePayload | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clearVersion, setClearVersion] = useState(0);
  const detectedSymbols = useMemo(() => extractJapaneseCharacters(messages), [messages]);
  const [targets, setTargets] = useState<TraceCharacterTarget[]>([]);
  const canvasSize = useCanvasSize(320, 96, 210);

  useEffect(() => {
    let cancelled = false;

    async function resolveTargets() {
      if (detectedSymbols.length === 0) {
        if (!cancelled) {
          setTargets([]);
          setSelectedId(null);
        }
        return;
      }

      try {
        const [kanaCatalog, kanjiCatalog] = await Promise.all([
          listKanaCatalog().catch(() => null),
          listKanjis().catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        const hiraganaMap = new Map(
          (kanaCatalog?.hiragana ?? []).map((kana) => [kana.symbol, kana]),
        );
        const katakanaMap = new Map(
          (kanaCatalog?.katakana ?? []).map((kana) => [kana.symbol, kana]),
        );
        const kanjiMap = new Map(
          (kanjiCatalog ?? []).map((kanji) => [kanji.symbol, kanji]),
        );

        const nextTargets: TraceCharacterTarget[] = [];

        for (const symbol of detectedSymbols) {
          const hiragana = hiraganaMap.get(symbol);
          if (hiragana) {
            nextTargets.push({
              id: `hiragana:${hiragana.id}`,
              symbol,
              type: "hiragana",
              label: `${symbol} · Hiragana`,
              note: getCharacterNote("hiragana"),
            });
            continue;
          }

          const katakana = katakanaMap.get(symbol);
          if (katakana) {
            nextTargets.push({
              id: `katakana:${katakana.id}`,
              symbol,
              type: "katakana",
              label: `${symbol} · Katakana`,
              note: getCharacterNote("katakana"),
            });
            continue;
          }

          const kanji = kanjiMap.get(symbol);
          if (kanji) {
            nextTargets.push({
              id: `kanji:${kanji.id}`,
              symbol,
              type: "kanji",
              label: `${symbol} · Kanji`,
              note: getCharacterNote("kanji"),
            });
            continue;
          }

          if (hasMockKanaStrokes(symbol)) {
            nextTargets.push({
              id: `hiragana:mock:${symbol}`,
              symbol,
              type: "hiragana",
              label: `${symbol} · Hiragana`,
              note: getCharacterNote("hiragana"),
            });
            continue;
          }

          if (hasMockStrokes(symbol)) {
            nextTargets.push({
              id: `kanji:mock:${symbol}`,
              symbol,
              type: "kanji",
              label: `${symbol} · Kanji`,
              note: getCharacterNote("kanji"),
            });
          }
        }

        setTargets(nextTargets);
        setSelectedId((previous) =>
          previous && nextTargets.some((target) => target.id === previous)
            ? previous
            : (nextTargets[0]?.id ?? null),
        );
      } catch {
        if (!cancelled) {
          setTargets([]);
          setSelectedId(null);
        }
      }
    }

    void resolveTargets();

    return () => {
      cancelled = true;
    };
  }, [detectedSymbols]);

  const activeTarget = useMemo(
    () => targets.find((target) => target.id === selectedId) ?? targets[0] ?? null,
    [selectedId, targets],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadStrokes() {
      if (!activeTarget) {
        setStrokePayload(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);
      setStrokePayload(null);

      try {
        if (activeTarget.type === "hiragana" || activeTarget.type === "katakana") {
          const kanaId = activeTarget.id.split(":")[1] === "mock"
            ? `mock-${activeTarget.symbol}`
            : activeTarget.id.split(":")[1];

          const strokeData: KanaStrokeData | null =
            activeTarget.id.includes(":mock:")
              ? getMockKanaStrokes(kanaId, activeTarget.symbol)
              : await getKanaStrokes(kanaId).catch(
                  () => getMockKanaStrokes(kanaId, activeTarget.symbol),
                );

          if (!strokeData) {
            throw new Error("No se encontraron trazos para este simbolo.");
          }

          if (!cancelled) {
            setStrokePayload({
              kind: activeTarget.type,
              viewBox: strokeData.viewBox,
              strokes: strokeData.strokes,
            });
          }
        } else {
          const kanjiId = activeTarget.id.includes(":mock:")
            ? `mock-${activeTarget.symbol}`
            : activeTarget.id.split(":")[1];

          const strokeData: KanjiStrokeData | null =
            activeTarget.id.includes(":mock:")
              ? getMockKanjiStrokes(kanjiId, activeTarget.symbol)
              : await getKanjiStrokes(kanjiId).catch(
                  () => getMockKanjiStrokes(kanjiId, activeTarget.symbol),
                );

          if (!strokeData) {
            throw new Error("No se encontraron trazos para este simbolo.");
          }

          if (!cancelled) {
            setStrokePayload({
              kind: "kanji",
              viewBox: strokeData.viewBox,
              strokes: strokeData.strokes,
            });
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "No se pudo cargar el trazado de este caracter.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setClearVersion((previous) => previous + 1);
        }
      }
    }

    void loadStrokes();

    return () => {
      cancelled = true;
    };
  }, [activeTarget]);

  const clearCanvas = useCallback(() => {
    setClearVersion((previous) => previous + 1);
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]">
      <div className="shrink-0 border-b border-border-subtle bg-surface-primary px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-content-primary">
              Trazado desde el chat
            </h3>
            <p className="mt-1 text-sm leading-6 text-content-tertiary">
              Aqui solo aparecen caracteres japoneses detectados en la conversacion actual para que practiques exactamente lo que estas usando.
            </p>
          </div>

          <span className="rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
            {targets.length}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {targets.length === 0 ? (
          <div className="flex h-full min-h-[260px] items-center justify-center rounded-[26px] border border-dashed border-border-default bg-surface-primary px-6 text-center">
            <div>
              <h4 className="text-base font-bold text-content-primary">
                Aun no detectamos caracteres japoneses
              </h4>
              <p className="mt-2 text-sm leading-6 text-content-tertiary">
                Cuando en el chat aparezcan hiragana, katakana o kanji, este tablero los convertira en objetivos de practica con sus trazos reales.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {targets.map((target) => (
                <button
                  key={target.id}
                  type="button"
                  onClick={() => setSelectedId(target.id)}
                  className={[
                    "rounded-full border px-3 py-2 text-sm font-semibold transition",
                    activeTarget?.id === target.id
                      ? "border-accent/30 bg-accent/10 text-accent"
                      : "border-border-default bg-surface-primary text-content-secondary hover:border-accent/15 hover:text-accent",
                  ].join(" ")}
                >
                  {target.symbol}
                </button>
              ))}
            </div>

            {activeTarget ? (
              <div className="rounded-[26px] border border-accent/12 bg-surface-primary p-4 shadow-sm">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-bold text-content-primary">
                      {activeTarget.label}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-content-tertiary">
                      {activeTarget.note}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-border-default bg-surface-elevated px-3 py-2 text-xs font-semibold text-content-secondary">
                      {getCharacterLabel(activeTarget.type)}
                    </span>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="rounded-full border border-border-default px-3 py-2 text-xs font-semibold text-content-secondary transition hover:bg-surface-elevated"
                    >
                      Limpiar tablero
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                    {error}
                  </div>
                ) : isLoading || !strokePayload ? (
                  <div className="flex aspect-square items-center justify-center rounded-[28px] border border-border-subtle bg-surface-elevated text-sm font-medium text-content-tertiary">
                    Cargando trazos...
                  </div>
                ) : strokePayload.kind === "kanji" ? (
                  <div className="flex justify-center">
                    <KanjiWritingCanvas
                      key={`${activeTarget.id}:${clearVersion}`}
                      viewBox={strokePayload.viewBox}
                      guideStrokes={strokePayload.strokes}
                      activeStrokeIndex={0}
                      hideStrokeOrder
                      size={canvasSize}
                      onStrokeDrawn={() => {}}
                    />
                  </div>
                ) : (
                  <div className="flex justify-center">
                    <KanaWritingCanvas
                      key={`${activeTarget.id}:${clearVersion}`}
                      viewBox={strokePayload.viewBox}
                      guideStrokes={strokePayload.strokes}
                      activeStrokeIndex={0}
                      hideActiveGuide
                      accentColor={
                        activeTarget.type === "katakana" ? "#1B5078" : "#7B3F8A"
                      }
                      size={canvasSize}
                      onStrokeDrawn={() => {}}
                    />
                  </div>
                )}

                <p className="mt-4 text-sm leading-6 text-content-tertiary">
                  Este tablero se alimenta solo del chat abierto. Cuando aparezca un caracter nuevo en la conversacion, lo veras disponible aqui para practicarlo.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}