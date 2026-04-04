"use client";

import { useMemo, useRef, useState } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  duration: string;
  isUserMessage?: boolean;
  waveform?: number[];
}

const FALLBACK_WAVEFORM = [
  8, 12, 18, 14, 10, 16, 22, 17, 11, 15, 20, 16, 10, 18, 24, 19, 12, 9, 8, 10,
  14, 18, 15, 10, 12, 17, 14, 9, 8, 10, 13, 16,
];

function normalizeWaveform(values?: number[], targetBars = 36) {
  const source = values && values.length > 0 ? values : FALLBACK_WAVEFORM;

  if (source.length === targetBars) return source;

  const bucketSize = source.length / targetBars;

  return Array.from({ length: targetBars }, (_, index) => {
    const start = Math.floor(index * bucketSize);
    const end = Math.floor((index + 1) * bucketSize);
    const slice = source.slice(start, Math.max(start + 1, end));

    const average =
      slice.reduce((sum, value) => sum + value, 0) / Math.max(slice.length, 1);

    return Math.max(5, Math.min(26, Math.round(average)));
  });
}

export function AudioPlayer({
  audioUrl,
  duration,
  isUserMessage = false,
  waveform,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const bars = useMemo(() => normalizeWaveform(waveform, 34), [waveform]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex w-full items-center gap-3">
      <button
        type="button"
        onClick={togglePlay}
        className={[
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors",
          isUserMessage
            ? "bg-surface-primary/18 hover:bg-surface-primary/28"
            : "bg-accent hover:bg-accent-hover",
        ].join(" ")}
        aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
      >
        {isPlaying ? (
          <svg
            className="h-4 w-4 text-content-inverted"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" />
          </svg>
        ) : (
          <svg
            className="ml-0.5 h-4 w-4 text-content-inverted"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6 4l10 6-10 6V4Z" />
          </svg>
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-end">
          <span
            className={`text-xs font-bold ${
              isUserMessage ? "text-white/90" : "text-content-tertiary"
            }`}
          >
            {duration}
          </span>
        </div>

        <div className="flex h-8 items-center gap-[3px] overflow-hidden">
          {bars.map((height, index) => (
            <div
              key={index}
              className={`w-[3px] shrink-0 rounded-full ${
                isUserMessage ? "bg-surface-primary/78" : "bg-accent/58"
              }`}
              style={{
                height: `${Math.max(5, Math.min(height, 26))}px`,
              }}
            />
          ))}
        </div>
      </div>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
        preload="none"
      />
    </div>
  );
}
