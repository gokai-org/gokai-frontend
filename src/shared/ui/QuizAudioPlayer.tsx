"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAudioPlaybackRate } from "@/shared/hooks/useAudioPlaybackRate";

type QuizAudioPlayerProps = {
  audioUrl: string;
};

const FALLBACK_WAVEFORM = [
  10, 14, 18, 16, 12, 20, 25, 19, 12, 15, 21, 17, 11, 19, 24, 18, 13, 10, 8,
  11, 15, 19, 17, 12, 14, 19, 16, 11,
];

function formatTime(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(value);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function QuizAudioPlayer({ audioUrl }: QuizAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { playbackRate } = useAudioPlaybackRate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    audio.playbackRate = playbackRate;
  }, [audioUrl, playbackRate]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audio.duration || 0);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  const progress = duration > 0 ? currentTime / duration : 0;
  const bars = useMemo(() => FALLBACK_WAVEFORM, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="mt-4 rounded-[24px] border border-accent/12 bg-surface-primary px-4 py-3 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.28)]">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlayback}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-content-inverted transition-colors hover:bg-accent-hover"
          aria-label={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? (
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4h3v12H5V4Zm7 0h3v12h-3V4Z" />
            </svg>
          ) : (
            <svg className="ml-0.5 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4Z" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-content-primary">
              Escucha el audio
            </p>
            <span className="text-xs font-bold text-content-tertiary">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex h-8 items-end gap-[3px] overflow-hidden rounded-2xl bg-surface-secondary px-3 py-[7px]">
            {bars.map((height, index) => {
              const threshold = (index + 1) / bars.length;
              const isActive = progress >= threshold;

              return (
                <div
                  key={index}
                  className={isActive ? "min-w-0 flex-1 rounded-full bg-accent" : "min-w-0 flex-1 rounded-full bg-accent/16"}
                  style={{ height: `${height}px`, maxHeight: "26px" }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}