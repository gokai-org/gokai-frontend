"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export interface RecordedAudioResult {
  blob: Blob;
  url: string;
  durationInSeconds: number;
  mimeType: string;
  waveform: number[];
}

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isPreparing: boolean;
  durationInSeconds: number;
  formattedDuration: string;
  audioLevel: number;
  waveformBars: number[];
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordedAudioResult | null>;
  cancelRecording: () => void;
  clearError: () => void;
}

function formatDuration(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function getSupportedMimeType() {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];

  if (typeof MediaRecorder === "undefined") return "";

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

const MAX_WAVEFORM_SAMPLES = 72;
const MIN_BAR_HEIGHT = 5;
const MAX_BAR_HEIGHT = 28;

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [durationInSeconds, setDurationInSeconds] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const mimeTypeRef = useRef<string>("");
  const smoothedLevelRef = useRef(0);
  const waveformRef = useRef<number[]>([]);

  const formattedDuration = useMemo(
    () => formatDuration(durationInSeconds),
    [durationInSeconds],
  );

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearAudioAnalysis = () => {
    if (animationFrameRef.current) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    try {
      sourceRef.current?.disconnect();
    } catch {}

    try {
      analyserRef.current?.disconnect();
    } catch {}

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => undefined);
    }

    sourceRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;

    smoothedLevelRef.current = 0;
    waveformRef.current = [];
    setAudioLevel(0);
    setWaveformBars([]);
  };

  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const clearError = () => setError(null);

  const startAudioAnalysis = useCallback((stream: MediaStream) => {
    const AudioContextClass =
      window.AudioContext ||
      // @ts-expect-error fallback viejo Safari
      window.webkitAudioContext;

    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    const source = context.createMediaStreamSource(stream);

    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.55;

    source.connect(analyser);

    audioContextRef.current = context;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const timeDomainData = new Uint8Array(analyser.fftSize);

    const tick = () => {
      if (!analyserRef.current) return;

      analyserRef.current.getByteTimeDomainData(timeDomainData);

      let sumSquares = 0;
      for (let i = 0; i < timeDomainData.length; i += 1) {
        const normalized = (timeDomainData[i] - 128) / 128;
        sumSquares += normalized * normalized;
      }

      const rms = Math.sqrt(sumSquares / timeDomainData.length);

      // amplificación para que se note MUCHO más
      const boosted = Math.min(1, Math.pow(rms * 4.6, 0.85));

      // menos suavizado para conservar los picos
      smoothedLevelRef.current =
        smoothedLevelRef.current * 0.45 + boosted * 0.55;

      const currentLevel = smoothedLevelRef.current;
      setAudioLevel(currentLevel);

      const nextHeight = Math.max(
        MIN_BAR_HEIGHT,
        Math.min(
          MAX_BAR_HEIGHT,
          Math.round(
            MIN_BAR_HEIGHT +
              Math.pow(currentLevel, 0.72) * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT),
          ),
        ),
      );

      waveformRef.current = [...waveformRef.current, nextHeight].slice(
        -MAX_WAVEFORM_SAMPLES,
      );
      setWaveformBars(waveformRef.current);

      animationFrameRef.current = window.requestAnimationFrame(tick);
    };

    animationFrameRef.current = window.requestAnimationFrame(tick);
  }, []);

  const startRecording = useCallback(async () => {
    if (isRecording || isPreparing) return;

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setError("Tu navegador no soporta grabación de audio.");
      return;
    }

    if (typeof MediaRecorder === "undefined") {
      setError("MediaRecorder no está disponible en este navegador.");
      return;
    }

    setError(null);
    setIsPreparing(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      streamRef.current = stream;
      mediaRecorderRef.current = recorder;
      mimeTypeRef.current = recorder.mimeType || mimeType || "audio/webm";
      chunksRef.current = [];
      setDurationInSeconds(0);
      setWaveformBars([]);
      waveformRef.current = [];
      smoothedLevelRef.current = 0;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.start(250);
      startAudioAnalysis(stream);

      timerRef.current = window.setInterval(() => {
        setDurationInSeconds((prev) => prev + 1);
      }, 1000);

      setIsRecording(true);
    } catch {
      setError("No se pudo acceder al micrófono. Revisa los permisos.");
      stopTracks();
      clearAudioAnalysis();
    } finally {
      setIsPreparing(false);
    }
  }, [isPreparing, isRecording, startAudioAnalysis]);

  const stopRecording = useCallback(async (): Promise<RecordedAudioResult | null> => {
    const recorder = mediaRecorderRef.current;

    if (!recorder || !isRecording) return null;

    return new Promise((resolve) => {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeTypeRef.current || "audio/webm",
        });

        const url = URL.createObjectURL(blob);

        const result: RecordedAudioResult = {
          blob,
          url,
          durationInSeconds,
          mimeType: mimeTypeRef.current || "audio/webm",
          waveform: [...waveformRef.current],
        };

        clearTimer();
        clearAudioAnalysis();
        stopTracks();

        mediaRecorderRef.current = null;
        chunksRef.current = [];
        setIsRecording(false);

        resolve(result);
      };

      recorder.stop();
    });
  }, [durationInSeconds, isRecording]);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      recorder.stop();
    }

    clearTimer();
    clearAudioAnalysis();
    stopTracks();

    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setDurationInSeconds(0);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      clearAudioAnalysis();
      stopTracks();
    };
  }, []);

  return {
    isRecording,
    isPreparing,
    durationInSeconds,
    formattedDuration,
    audioLevel,
    waveformBars,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    clearError,
  };
}