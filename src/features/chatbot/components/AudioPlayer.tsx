"use client";

import { useState, useRef, useMemo } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  duration: string;
  isUserMessage?: boolean;
}

export function AudioPlayer({
  audioUrl,
  duration,
  isUserMessage,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const barHeights = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
        const x = Math.sin(i * 127.1) * 43758.5453;
        return (x - Math.floor(x)) * 20 + 8;
      }),
    [],
  );

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUserMessage
            ? "bg-white/20 hover:bg-white/30"
            : "bg-[#993331] hover:bg-[#882d2d]"
        } transition-colors`}
      >
        {isPlaying ? (
          <svg
            className={`w-4 h-4 ${isUserMessage ? "text-white" : "text-white"}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z" />
          </svg>
        ) : (
          <svg
            className={`w-4 h-4 ${isUserMessage ? "text-white" : "text-white"} ml-0.5`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M6 4l10 6-10 6V4z" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-8 flex items-center gap-0.5">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full ${
                  isUserMessage ? "bg-white/60" : "bg-[#993331]/60"
                }`}
                style={{
                  height: `${h}px`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <span
        className={`text-xs ${isUserMessage ? "text-white/80" : "text-gray-500"}`}
      >
        {duration}
      </span>

      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}
