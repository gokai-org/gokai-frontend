"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@/features/chatbot/types";
import { ChatWritingSymbolChip } from "@/features/chatbot/components/ChatWritingSymbolChip";
import { ChatSurfacePanel } from "@/features/chatbot/components/ChatSurfacePanel";
import { KanaStrokePlayer } from "@/features/kana/components/KanaStrokePlayer";
import { KanaWritingCanvas } from "@/features/kana/components/KanaWritingCanvas";
import { KanjiStrokePlayer } from "@/features/kanji/components/KanjiStrokePlayer";
import { KanjiWritingCanvas } from "@/features/kanji/components/KanjiWritingCanvas";
import { ChatWritingNotebook } from "@/features/chatbot/components/ChatWritingNotebook";
import { useChatWritingPractice } from "@/features/chatbot/hooks/useChatWritingPractice";
import { extractJapaneseCharacters } from "@/features/chatbot/utils/writingCharacters";
import { getWritingPalette, hexToRgba } from "@/features/chatbot/utils/writingPalette";
import { useTheme } from "@/shared/hooks/useTheme";

interface ChatWritingPanelProps {
  message: ChatMessage | null;
  onClose?: () => void;
}

type WritingStrokePayload = NonNullable<
  ReturnType<typeof useChatWritingPractice>["strokePayload"]
>;
type WritingPalette = ReturnType<typeof getWritingPalette>;

interface ChatWritingGuidePreviewProps {
  targetType: "hiragana" | "katakana" | "kanji";
  strokePayload: WritingStrokePayload;
  palette: WritingPalette;
  accent: string;
  onStartPractice: () => void;
  compact?: boolean;
}

function ChatWritingGuidePreview({
  targetType,
  strokePayload,
  palette,
  accent,
  onStartPractice,
  compact = false,
}: ChatWritingGuidePreviewProps) {
  const [demoStrokeIndex, setDemoStrokeIndex] = useState(0);
  const [demoAutoPlay, setDemoAutoPlay] = useState(true);

  useEffect(() => {
    if (strokePayload.strokes.length === 0 || !demoAutoPlay) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDemoStrokeIndex((previous) => {
        const next = previous + 1;
        if (next >= strokePayload.strokes.length) {
          return 0;
        }

        return next;
      });
    }, 780);

    return () => window.clearTimeout(timeoutId);
  }, [demoAutoPlay, demoStrokeIndex, strokePayload]);

  return (
    <div className={`flex flex-col items-center text-center ${compact ? "gap-3" : "gap-4"}`}>
      <div
        className={`rounded-[24px] border ${compact ? "p-2" : "p-3"}`}
        style={{
          borderColor: palette.ring,
          backgroundColor: palette.soft,
        }}
      >
        {targetType === "kanji" ? (
          <KanjiStrokePlayer
            viewBox={strokePayload.viewBox}
            strokes={strokePayload.strokes}
            activeStrokeIndex={demoStrokeIndex}
            showNumbers
            numberMode="uptoActive"
            size={compact ? 216 : 260}
          />
        ) : (
          <KanaStrokePlayer
            viewBox={strokePayload.viewBox}
            strokes={strokePayload.strokes}
            activeStrokeIndex={demoStrokeIndex}
            showNumbers
            numberMode="uptoActive"
            size={compact ? 216 : 260}
          />
        )}
      </div>

      <div>
        <p className={`${compact ? "text-xs" : "text-sm"} font-semibold text-content-primary`}>
          Observa primero el orden de los trazos
        </p>
        <p className={`mt-1 ${compact ? "text-xs leading-5" : "text-sm leading-6"} text-content-tertiary`}>
          La guia se reproduce sola. Cuando lo tengas claro, pasa a la practica para escribirlo letra por letra.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDemoAutoPlay((current) => !current)}
          className={`inline-flex items-center justify-center rounded-full border font-semibold transition ${compact ? "h-9 w-9 px-0 py-0" : "px-3 py-2 text-xs"}`}
          style={{
            borderColor: palette.borderSoft,
            color: accent,
            backgroundColor: palette.soft,
          }}
          aria-label={demoAutoPlay ? "Pausar guia" : "Reproducir guia"}
        >
          {compact ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              {demoAutoPlay ? (
                <>
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </>
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          ) : demoAutoPlay ? (
            "Pausar guia"
          ) : (
            "Reproducir guia"
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onStartPractice}
        className={`rounded-full font-semibold text-content-inverted transition ${compact ? "px-4 py-2 text-xs" : "px-5 py-2.5 text-sm"}`}
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, ${hexToRgba(accent, 0.86)} 100%)`,
          boxShadow: `0 14px 30px -18px ${palette.glow}`,
        }}
      >
        {compact ? "Trazar" : "Empezar a trazar"}
      </button>
    </div>
  );
}

export function ChatWritingPanel({ message, onClose }: ChatWritingPanelProps) {
  const { theme } = useTheme();
  const {
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
  } = useChatWritingPractice(message);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const [dismissedCompletionSequence, setDismissedCompletionSequence] = useState(0);

  const palette = getWritingPalette(
    activeTarget?.accentColor ?? targets[0]?.accentColor,
  );
  const accent = palette.accent;
  const completedCount = completedTargetIds.size;
  const totalAvailableCount = availableTargets.length;
  const canOpenNotebook = hasCompletedMessage && notebookEntries.length > 0;
  const shouldAutoOpenNotebook =
    canOpenNotebook && completionSequence > dismissedCompletionSequence;
  const isNotebookOpen = canOpenNotebook && (notebookOpen || shouldAutoOpenNotebook);
  const compactMobileLayout = !onClose;
  const hasMessageCharacters = useMemo(
    () => extractJapaneseCharacters(message?.content ?? "", { unique: true }).length > 0,
    [message?.content],
  );
  const shouldShowTargetsSkeleton =
    Boolean(message) &&
    hasMessageCharacters &&
    (targetsLoading || (targets.length === 0 && !error && !activeTarget));

  const notebookSummary = useMemo(() => {
    if (shouldShowTargetsSkeleton) {
      return "";
    }

    if (totalAvailableCount === 0) {
      return "No hay letras disponibles para este mensaje.";
    }

    if (hasCompletedMessage) {
      return "Tu cuaderno esta listo para abrirse con toda la caligrafia del mensaje.";
    }

    return `Completa ${completedCount} de ${totalAvailableCount} letras disponibles para desbloquear el cuaderno.`;
  }, [completedCount, hasCompletedMessage, shouldShowTargetsSkeleton, totalAvailableCount]);

  const handleOpenNotebook = () => {
    if (!canOpenNotebook) {
      return;
    }

    setNotebookOpen(true);
  };

  const handleCloseNotebook = () => {
    setNotebookOpen(false);
    setDismissedCompletionSequence(completionSequence);
  };

  return (
    <section className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]">
      <div className="hidden shrink-0 border-b border-border-subtle bg-surface-primary px-4 py-4 sm:block sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-content-primary">
              Escritura desde el chat
            </h3>
            <p className="mt-1 text-sm leading-6 text-content-tertiary">
              En el siguiente recuadro puede escribir las diferentes letras de japones que incluya el mensaje.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border bg-surface-elevated text-content-secondary transition"
                style={{
                  borderColor: palette.borderSoft,
                  color: accent,
                  backgroundColor: palette.soft,
                }}
                aria-label="Cerrar escritura"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6 18 18" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div
        className={`accent-scroll-area min-h-0 flex-1 overflow-y-auto ${compactMobileLayout ? "px-3 py-3 sm:px-5 sm:py-4" : "px-4 py-4 sm:px-5"}`}
        style={{
          ["--accent-scrollbar-thumb" as string]: palette.ringStrong,
          ["--accent-scrollbar-thumb-hover" as string]: palette.symbolMuted,
        }}
      >
        {!message ? (
          <div className="flex min-h-[280px] items-center justify-center rounded-[26px] border border-dashed border-border-default bg-surface-primary px-6 text-center">
            <div>
              <h4 className="text-base font-bold text-content-primary">
                Selecciona un mensaje con escritura japonesa
              </h4>
              <p className="mt-2 text-sm leading-6 text-content-tertiary">
                Cada mensaje que tenga hiragana, katakana o kanji mostrara su acceso directo de escritura.
              </p>
            </div>
          </div>
        ) : (
          <div className={compactMobileLayout ? "space-y-3" : "space-y-4"}>
            <article className={`rounded-[24px] border border-border-subtle bg-surface-primary shadow-sm ${compactMobileLayout ? "p-3" : "p-4"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p
                    className="text-[11px] font-black uppercase tracking-[0.16em]"
                    style={{ color: palette.symbolMuted }}
                  >
                    Letras japonesas en este mensaje
                  </p>
                    <p className={`mt-1 text-content-tertiary ${compactMobileLayout ? "hidden sm:block sm:text-sm sm:leading-6" : "text-sm leading-6"}`}>
                    En el siguiente recuadro puedes seleccionar las diferentes letras de japones que incluya el mensaje para practicarlas y después admirar la caligrafía.
                    </p>
                </div>
              </div>

              {shouldShowTargetsSkeleton ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={`chat-writing-chip-skeleton-${index}`}
                      className="h-11 w-11 animate-pulse rounded-2xl bg-surface-secondary"
                    />
                  ))}
                </div>
              ) : targets.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1">
                  {targets.map((target) => (
                    <ChatWritingSymbolChip
                      key={target.id}
                      target={target}
                      selected={activeTarget?.id === target.id}
                      onSelect={() => selectTarget(target.id)}
                    />
                  ))}
                </div>
              ) : null}
            </article>

            {shouldShowTargetsSkeleton ? (
              <div className="space-y-3">
                <div className="rounded-[26px] border border-border-subtle bg-surface-primary p-4 shadow-sm sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-5 w-40 animate-pulse rounded-full bg-surface-secondary" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-surface-secondary" />
                      <div className="h-4 w-4/5 animate-pulse rounded-full bg-surface-secondary" />
                    </div>
                    <div className="h-7 w-20 animate-pulse rounded-full bg-surface-secondary" />
                  </div>
                  <div className="mt-4 h-32 animate-pulse rounded-[22px] bg-surface-secondary" />
                </div>
                <div className="rounded-[24px] border border-border-subtle bg-surface-primary p-4 shadow-sm">
                  <div className="h-4 w-36 animate-pulse rounded-full bg-surface-secondary" />
                  <div className="mt-3 h-4 w-full animate-pulse rounded-full bg-surface-secondary" />
                </div>
              </div>
            ) : error ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800">
                {error}
              </div>
            ) : activeTarget ? (
              <article className={`rounded-[26px] border border-border-subtle bg-surface-primary shadow-sm ${compactMobileLayout ? "p-3 sm:p-5" : "p-4 sm:p-5"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className={`${compactMobileLayout ? "text-sm" : "text-base"} font-bold text-content-primary`}>
                      {activeTarget.title}
                    </h4>
                    {activeTarget.status === "available" ? (
                      <p className={`mt-1 text-content-tertiary ${compactMobileLayout ? "hidden sm:block sm:text-sm sm:leading-6" : "text-sm leading-6"}`}>
                        Mira la guia y luego traza en el lienzo con el color de este sistema de escritura.
                      </p>
                    ) : null}
                  </div>

                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        activeTarget.status === "available"
                          ? palette.softStrong
                          : palette.soft,
                      color: accent,
                    }}
                  >
                    {activeTarget.badge}
                  </span>
                </div>

                {activeTarget.status !== "available" ? (
                  <div className="mt-4 rounded-[22px] border border-dashed border-border-default bg-surface-elevated px-4 py-5 text-sm leading-6 text-content-tertiary">
                    <p>{activeTarget.helper}</p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`mt-4 rounded-[28px] border ${compactMobileLayout ? "p-3" : "p-4"}`}
                      style={{
                        borderColor: palette.ring,
                        background: `linear-gradient(180deg, ${palette.soft} 0%, rgba(255,255,255,0.02) 100%)`,
                        boxShadow: `0 18px 40px -26px ${palette.glow}`,
                        ["--accent" as string]: accent,
                      }}
                    >
                      {strokeLoading || !strokePayload ? (
                        <div className={`flex items-center justify-center text-sm font-medium text-content-tertiary ${compactMobileLayout ? "min-h-[240px]" : "min-h-[320px]"}`}>
                          Cargando trazos...
                        </div>
                      ) : phase === "guide" ? (
                        <ChatWritingGuidePreview
                          key={`${activeTarget.id}:${strokePayload.viewBox}`}
                          targetType={activeTarget.type}
                          strokePayload={strokePayload}
                          palette={palette}
                          accent={accent}
                          onStartPractice={startPractice}
                          compact={compactMobileLayout}
                        />
                      ) : (
                        <div className={`flex flex-col items-center text-center ${compactMobileLayout ? "gap-3" : "gap-4"}`}>
                          <div
                            className={`rounded-[24px] border ${compactMobileLayout ? "p-2" : "p-2.5"}`}
                            style={{
                              borderColor: flashError ? "#f87171" : palette.ring,
                              backgroundColor: palette.soft,
                            }}
                          >
                            {activeTarget.type === "kanji" ? (
                              <KanjiWritingCanvas
                                viewBox={strokePayload.viewBox}
                                guideStrokes={strokePayload.strokes}
                                activeStrokeIndex={activeStrokeIndex}
                                onStrokeDrawn={handleStrokeDrawn}
                                size={compactMobileLayout ? 216 : 260}
                                flashError={flashError}
                                accentColor={activeTarget.accentColor}
                                className="bg-surface-secondary"
                              />
                            ) : (
                              <KanaWritingCanvas
                                viewBox={strokePayload.viewBox}
                                guideStrokes={strokePayload.strokes}
                                activeStrokeIndex={activeStrokeIndex}
                                onStrokeDrawn={handleStrokeDrawn}
                                size={compactMobileLayout ? 216 : 260}
                                flashError={flashError}
                                accentColor={activeTarget.accentColor}
                                className="bg-surface-secondary"
                              />
                            )}
                          </div>

                          <div>
                            <p className={`${compactMobileLayout ? "text-xs" : "text-sm"} font-semibold text-content-primary`}>
                              Trazo {Math.min(activeStrokeIndex + 1, strokePayload.strokes.length)} de {strokePayload.strokes.length}
                            </p>
                            <p className={`mt-1 text-content-tertiary ${compactMobileLayout ? "text-xs leading-5" : "text-sm leading-6"}`}>
                              Repite el orden del ejemplo. Al completar el simbolo, se guardara automaticamente en el cuaderno.
                            </p>
                          </div>

                          {feedback ? (
                            <span
                              className={[
                                "rounded-full px-3 py-1 text-xs font-semibold",
                                feedback.colorClassName,
                              ].join(" ")}
                            >
                              {feedback.label}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <div className={`mt-4 flex ${compactMobileLayout ? "justify-center" : "flex-wrap"} gap-2`}>
                      {phase === "guide" ? (
                        <button
                          type="button"
                          onClick={startPractice}
                          className={`inline-flex items-center justify-center rounded-full font-semibold text-content-inverted transition ${compactMobileLayout ? "h-10 w-10 px-0 py-0" : "px-4 py-2 text-sm"}`}
                          style={{
                            background: `linear-gradient(90deg, ${accent} 0%, ${hexToRgba(accent, 0.86)} 100%)`,
                            boxShadow: `0 14px 30px -18px ${palette.glow}`,
                          }}
                          aria-label="Empezar a trazar"
                        >
                          {compactMobileLayout ? (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                          ) : (
                            "Empezar a trazar"
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={goBackToGuide}
                            className={`inline-flex items-center justify-center rounded-full border bg-surface-elevated font-semibold transition ${compactMobileLayout ? "h-10 w-10 px-0 py-0" : "px-4 py-2 text-sm"}`}
                            style={{
                              borderColor: palette.borderSoft,
                              color: accent,
                              backgroundColor: palette.soft,
                            }}
                            aria-label="Ver guia"
                            >
                            {compactMobileLayout ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 12 7-7v4h11v6H10v4l-7-7Z" /></svg>
                            ) : (
                              "Ver guia"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={resetCurrentPractice}
                            className={`inline-flex items-center justify-center rounded-full border bg-surface-primary font-semibold transition ${compactMobileLayout ? "h-10 w-10 px-0 py-0" : "px-4 py-2 text-sm"}`}
                            style={{
                              borderColor: palette.borderSoft,
                              color: accent,
                              backgroundColor: palette.soft,
                            }}
                            aria-label="Intentar otra vez"
                            >
                            {compactMobileLayout ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 3v6h6" /></svg>
                            ) : (
                              "Intentar esta letra otra vez"
                            )}
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleOpenNotebook}
                        disabled={!canOpenNotebook}
                        className={`inline-flex items-center justify-center rounded-full border bg-surface-primary font-semibold transition ${compactMobileLayout ? "h-10 w-10 px-0 py-0" : "px-4 py-2 text-sm"}`}
                        style={{
                          borderColor: palette.borderSoft,
                          color: accent,
                          backgroundColor: palette.soft,
                          opacity: canOpenNotebook ? 1 : 0.5,
                        }}
                        aria-label="Ver cuaderno"
                        >
                        <span className={`inline-flex items-center ${compactMobileLayout ? "justify-center gap-0" : "gap-2"}`}>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                          </svg>
                          <span className={compactMobileLayout ? "sr-only sm:not-sr-only" : ""}>
                            Ver cuaderno
                          </span>
                        </span>
                      </button>
                    </div>

                    {notebookSummary ? (
                      <p className={`mt-3 text-content-tertiary ${compactMobileLayout ? "hidden text-[11px] leading-4 sm:block" : "text-xs leading-5"}`}>
                        {notebookSummary}
                      </p>
                    ) : null}
                  </>
                )}
              </article>
            ) : null}

            {!shouldShowTargetsSkeleton && targets.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-border-default bg-surface-primary px-6 py-8 text-center">
                <h4 className="text-base font-bold text-content-primary">
                  Este mensaje no tiene simbolos practicables
                </h4>
                <p className="mt-2 text-sm leading-6 text-content-tertiary">
                  Cuando el mensaje contenga hiragana, katakana o kanji, aqui apareceran sus accesos de escritura.
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <ChatSurfacePanel
        open={isNotebookOpen}
        title="Cuaderno de caligrafia"
        subtitle="La hoja aparece al completar todas las letras disponibles del mensaje."
        onClose={handleCloseNotebook}
        mode="dialog"
        panelClassName="border-[#d7c8a6]/40 bg-[#f7f1df] dark:border-white/10 dark:bg-[#121212]"
        bodyClassName="accent-scroll-area"
        bodyStyle={{
          ["--accent-scrollbar-thumb" as string]: palette.ringStrong,
          ["--accent-scrollbar-thumb-hover" as string]: palette.symbolMuted,
        }}
      >
        <div className="flex h-full min-h-0 flex-col gap-5 bg-transparent px-4 py-4 sm:px-6 sm:py-6">
          <ChatWritingNotebook
            targets={targets}
            entries={notebookEntries}
            activeTargetId={activeTarget?.id}
            themeMode={theme}
            hideHeader
          />

          <div className="mt-auto flex flex-wrap gap-2 border-t border-black/5 pt-4 dark:border-white/5">
            <button
              type="button"
              onClick={() => {
                restartMessagePractice();
                handleCloseNotebook();
              }}
              className="rounded-full px-4 py-2 text-sm font-semibold text-content-inverted transition"
              style={{
                background: `linear-gradient(90deg, ${accent} 0%, ${hexToRgba(accent, 0.86)} 100%)`,
                boxShadow: `0 14px 30px -18px ${palette.glow}`,
              }}
            >
              Empezar de nuevo
            </button>

            <button
              type="button"
              onClick={() => {
                clearNotebook();
                restartMessagePractice();
                handleCloseNotebook();
              }}
              className="rounded-full border bg-surface-primary px-4 py-2 text-sm font-semibold transition"
              style={{
                borderColor: palette.borderSoft,
                color: accent,
                backgroundColor: palette.soft,
              }}
            >
              Vaciar cuaderno
            </button>

            <button
              type="button"
              onClick={handleCloseNotebook}
              className="rounded-full border bg-surface-primary px-4 py-2 text-sm font-semibold transition"
              style={{
                borderColor: palette.borderSoft,
                color: accent,
                backgroundColor: palette.soft,
              }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </ChatSurfacePanel>
    </section>
  );
}