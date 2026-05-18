"use client";

import { useEffect, useState } from "react";

export const AUDIO_SPEED_CHANGE_EVENT = "gokai-audio-speed-change";
export const AUDIO_SPEED_STORAGE_KEY = "gokai-audio-speed";
export const AUDIO_SPEED_OPTIONS = [
  "Muy lento",
  "Lento",
  "Normal",
  "Alta",
  "Rápido",
] as const;

export type AudioSpeedOption = (typeof AUDIO_SPEED_OPTIONS)[number];

const DEFAULT_AUDIO_SPEED: AudioSpeedOption = "Normal";

const AUDIO_SPEED_PLAYBACK_RATES: Record<AudioSpeedOption, number> = {
  "Muy lento": 0.6,
  Lento: 0.8,
  Normal: 1,
  Alta: 1.15,
  "Rápido": 1.3,
};

function normalizeAudioSpeedKey(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function normalizeAudioSpeed(value?: string | null): AudioSpeedOption {
  const normalizedValue = normalizeAudioSpeedKey(value ?? "");

  if (normalizedValue === "muy lento") {
    return "Muy lento";
  }

  if (normalizedValue === "lento") {
    return "Lento";
  }

  if (normalizedValue === "alta" || normalizedValue === "alto") {
    return "Alta";
  }

  if (normalizedValue === "rapido") {
    return "Rápido";
  }

  return DEFAULT_AUDIO_SPEED;
}

export function getAudioPlaybackRate(audioSpeed?: string | null) {
  return AUDIO_SPEED_PLAYBACK_RATES[normalizeAudioSpeed(audioSpeed)];
}

export function readStoredAudioSpeed() {
  if (typeof window === "undefined") {
    return DEFAULT_AUDIO_SPEED;
  }

  try {
    return normalizeAudioSpeed(
      window.localStorage.getItem(AUDIO_SPEED_STORAGE_KEY),
    );
  } catch {
    return DEFAULT_AUDIO_SPEED;
  }
}

export function setStoredAudioSpeed(audioSpeed: string) {
  const normalizedAudioSpeed = normalizeAudioSpeed(audioSpeed);

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(AUDIO_SPEED_STORAGE_KEY, normalizedAudioSpeed);
    } catch {}

    window.dispatchEvent(
      new CustomEvent<{ audioSpeed: AudioSpeedOption }>(
        AUDIO_SPEED_CHANGE_EVENT,
        { detail: { audioSpeed: normalizedAudioSpeed } },
      ),
    );
  }

  return normalizedAudioSpeed;
}

export function useAudioPlaybackRate() {
  const [audioSpeed, setAudioSpeed] = useState<AudioSpeedOption>(() =>
    readStoredAudioSpeed(),
  );

  useEffect(() => {
    const handleAudioSpeedChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ audioSpeed?: string }>;
      setAudioSpeed(normalizeAudioSpeed(customEvent.detail?.audioSpeed));
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== AUDIO_SPEED_STORAGE_KEY) {
        return;
      }

      setAudioSpeed(normalizeAudioSpeed(event.newValue));
    };

    window.addEventListener(AUDIO_SPEED_CHANGE_EVENT, handleAudioSpeedChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        AUDIO_SPEED_CHANGE_EVENT,
        handleAudioSpeedChange,
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return {
    audioSpeed,
    playbackRate: getAudioPlaybackRate(audioSpeed),
  };
}