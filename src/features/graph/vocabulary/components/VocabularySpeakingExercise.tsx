"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AudioPlayer } from "@/features/chatbot/components/AudioPlayer";
import { ChatRecordingPanel } from "@/features/chatbot/components/ChatRecordingPanel";
import {
  useAudioRecorder,
  type RecordedAudioResult,
} from "@/features/chatbot/hooks/useAudioRecorder";
import { convertAudioBlobToMonoWavFile } from "@/shared/lib/audio/wav";
import { getVocabularyPronunciationFeedback } from "../services/api";
import type {
  VocabularyPronunciationFeedbackResponse,
  VocabularyQuizQuestion,
} from "../types";

type VocabularySpeakingExerciseProps = {
  question: VocabularyQuizQuestion;
  step: "exercise" | "feedback";
  onScoreChange: (score: number | null) => void;
};

const MIN_PRONUNCIATION_DURATION_SECONDS = 1;
const MAX_PRONUNCIATION_DURATION_SECONDS = 5;
const MIN_AUDIO_BLOB_SIZE_BYTES = 4096;
const MIN_WAVEFORM_SAMPLE_COUNT = 10;
const MIN_WAVEFORM_AVERAGE = 6.4;
const MIN_WAVEFORM_PEAK = 9;

function formatAudioDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function normalizePronunciationScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRecordingValidationError(recording: RecordedAudioResult) {
  if (recording.durationInSeconds < MIN_PRONUNCIATION_DURATION_SECONDS) {
    return "Tu grabación quedó demasiado corta. Habla al menos un instante completo antes de detenerla.";
  }

  if (recording.durationInSeconds > MAX_PRONUNCIATION_DURATION_SECONDS) {
    return "El audio no puede durar más de 5 segundos. Se descartó el intento y debes grabar de nuevo.";
  }

  if (recording.blob.size < MIN_AUDIO_BLOB_SIZE_BYTES) {
    return "El audio quedó casi vacío. Intenta grabar otra vez con el micrófono más cerca.";
  }

  if (recording.waveform.length < MIN_WAVEFORM_SAMPLE_COUNT) {
    return "No se alcanzó a detectar suficiente voz. Intenta sostener la pronunciación un poco más.";
  }

  const averageWaveform =
    recording.waveform.reduce((sum, value) => sum + value, 0) /
    Math.max(recording.waveform.length, 1);
  const peakWaveform = Math.max(...recording.waveform);

  if (
    averageWaveform < MIN_WAVEFORM_AVERAGE &&
    peakWaveform < MIN_WAVEFORM_PEAK
  ) {
    return "No se escuchó una voz clara en la grabación. Repite el intento con más volumen y menos silencio al inicio.";
  }

  return null;
}

export default function VocabularySpeakingExercise({
  question,
  step,
  onScoreChange,
}: VocabularySpeakingExerciseProps) {
  const {
    isRecording,
    isPreparing,
    durationInSeconds,
    formattedDuration,
    audioLevel,
    waveformBars,
    error: recorderError,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  } = useAudioRecorder();
  const [attempt, setAttempt] = useState<RecordedAudioResult | null>(null);
  const [feedback, setFeedback] = useState<VocabularyPronunciationFeedbackResponse | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (attempt?.url) {
        URL.revokeObjectURL(attempt.url);
      }
    };
  }, [attempt]);

  useEffect(() => {
    if (!isRecording || durationInSeconds <= MAX_PRONUNCIATION_DURATION_SECONDS) {
      return;
    }

    cancelRecording();
    clearError();
    setRequestPending(false);
    setFeedback(null);
    setAttempt((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });
    setRequestError(
      "El audio no puede durar más de 5 segundos. Se descartó el intento y debes grabar de nuevo.",
    );
    onScoreChange(null);
  }, [cancelRecording, clearError, durationInSeconds, isRecording, onScoreChange]);

  const attemptDuration = useMemo(
    () => (attempt ? formatAudioDuration(attempt.durationInSeconds) : "00:00"),
    [attempt],
  );

  const evaluateAttempt = useCallback(
    async (recording: RecordedAudioResult) => {
      setRequestPending(true);
      setRequestError(null);
      setFeedback(null);
      onScoreChange(null);

      try {
        const wavFile = await convertAudioBlobToMonoWavFile(
          recording.blob,
          `${question.wordId}.wav`,
        );
        const nextFeedback = await getVocabularyPronunciationFeedback(
          question.wordId,
          wavFile,
          question.hiragana,
        );
        const nextScore = normalizePronunciationScore(nextFeedback.score);

        setFeedback(nextFeedback);
        onScoreChange(nextScore);
      } catch (error) {
        console.error("Error evaluando pronunciación de vocabulario:", error);
        setRequestError(
          error instanceof Error
            ? error.message
            : "No se pudo evaluar la pronunciación.",
        );
        onScoreChange(null);
      } finally {
        setRequestPending(false);
      }
    },
    [onScoreChange, question.wordId],
  );

  const handleStartRecording = useCallback(async () => {
    if (step !== "exercise") {
      return;
    }

    clearError();
    onScoreChange(null);
    setRequestError(null);
    setFeedback(null);
    setAttempt((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return null;
    });

    await startRecording();
  }, [clearError, onScoreChange, startRecording, step]);

  const handleStopRecording = useCallback(async () => {
    const recording = await stopRecording();

    if (!recording) {
      return;
    }

    const validationError = getRecordingValidationError(recording);
    if (validationError) {
      URL.revokeObjectURL(recording.url);
      setAttempt((current) => {
        if (current?.url) {
          URL.revokeObjectURL(current.url);
        }

        return null;
      });
      setFeedback(null);
      setRequestError(validationError);
      onScoreChange(null);
      return;
    }

    setAttempt((current) => {
      if (current?.url) {
        URL.revokeObjectURL(current.url);
      }

      return recording;
    });

    await evaluateAttempt(recording);
  }, [evaluateAttempt, onScoreChange, stopRecording]);

  const handleCancelRecording = useCallback(() => {
    cancelRecording();
    clearError();
    setRequestPending(false);
    setRequestError(null);
    setFeedback(null);
    onScoreChange(null);
  }, [cancelRecording, clearError, onScoreChange]);

  const handleRetryEvaluation = useCallback(async () => {
    if (!attempt || step !== "exercise") {
      return;
    }

    await evaluateAttempt(attempt);
  }, [attempt, evaluateAttempt, step]);

  const scoreLabel = feedback ? normalizePronunciationScore(feedback.score) : null;

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4 text-center">
        <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
          Pronunciación guiada
        </p>
        <p className="mt-2 text-sm leading-relaxed text-content-secondary">
          Graba tu intento y recibirás una evaluación automática de pronunciación para esta palabra. El audio debe durar como máximo 5 segundos.
        </p>
      </div>

      {(isRecording || isPreparing) ? (
        <ChatRecordingPanel
          isRecording={isRecording}
          isPreparing={isPreparing}
          duration={formattedDuration}
          audioLevel={audioLevel}
          waveformBars={waveformBars}
          onStop={() => void handleStopRecording()}
          onCancel={handleCancelRecording}
        />
      ) : null}

      {!isRecording && !isPreparing ? (
        <div className="space-y-3">
          {attempt ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                Tu intento
              </p>
              <div className="mt-3">
                <AudioPlayer
                  audioUrl={attempt.url}
                  duration={attemptDuration}
                  waveform={attempt.waveform}
                />
              </div>
            </div>
          ) : null}

          {requestPending ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-secondary/70 px-4 py-5 text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-border-subtle border-t-accent" />
              <p className="mt-3 text-sm font-semibold text-content-primary">
                Evaluando pronunciación...
              </p>
              <p className="mt-1 text-xs text-content-tertiary">
                Estamos comparando tu audio con la pronunciación esperada.
              </p>
            </div>
          ) : null}

          {feedback ? (
            <div className="rounded-2xl border border-border-subtle bg-surface-primary p-4">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                    Resultado de pronunciación
                  </p>
                  <p className="mt-2 text-3xl font-black text-content-primary">
                    {scoreLabel}%
                  </p>
                </div>

                <div className="rounded-2xl bg-surface-secondary px-3 py-2 text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-content-tertiary">
                    Romaji detectado
                  </p>
                  <p className="mt-1 text-sm font-bold text-content-secondary">
                    {feedback.recognized_speech || "Sin resultado"}
                  </p>
                </div>
              </div>

              {feedback.feedback.length > 0 ? (
                <div className="mt-4 rounded-2xl bg-surface-secondary px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-content-tertiary">
                    Tips para mejorar
                  </p>
                  <ul className="mt-2 space-y-2 text-sm text-content-secondary">
                    {feedback.feedback.map((item) => (
                      <li key={item} className="leading-relaxed">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}

          {requestError || recorderError ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/8 px-4 py-4 text-sm text-red-500">
              {requestError ?? recorderError}
            </div>
          ) : null}

          {step === "exercise" ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleStartRecording()}
                disabled={requestPending}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-content-inverted transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-70"
              >
                {attempt ? "Grabar de nuevo" : "Grabar respuesta"}
              </button>

              {attempt && requestError ? (
                <button
                  type="button"
                  onClick={() => void handleRetryEvaluation()}
                  disabled={requestPending}
                  className="rounded-full border border-border-default bg-surface-primary px-4 py-2 text-sm font-semibold text-content-secondary transition hover:bg-surface-secondary disabled:cursor-wait disabled:opacity-70"
                >
                  Reintentar evaluación
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}