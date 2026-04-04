"use client";

import { AnimatedEntrance } from "@/shared/ui/AnimatedEntrance";

interface ChatRecordingPanelProps {
  isRecording: boolean;
  isPreparing?: boolean;
  duration: string;
  audioLevel: number;
  waveformBars: number[];
  animationsEnabled?: boolean;
  heavyAnimationsEnabled?: boolean;
  onStop: () => void;
  onCancel: () => void;
}

const TOTAL_SLOTS = 72;
const BASE_BAR_HEIGHT = 5;

export function ChatRecordingPanel({
  isRecording,
  isPreparing = false,
  duration,
  audioLevel,
  waveformBars,
  animationsEnabled = true,
  heavyAnimationsEnabled = true,
  onStop,
  onCancel,
}: ChatRecordingPanelProps) {
  if (!isRecording && !isPreparing) return null;

  const emptySlots = Math.max(0, TOTAL_SLOTS - waveformBars.length);

  return (
    <AnimatedEntrance
      disabled={!animationsEnabled}
      mode={heavyAnimationsEnabled ? "default" : "light"}
      className="mb-3"
    >
      <div className="rounded-[28px] border border-accent/12 bg-surface-primary p-4 shadow-[0_10px_24px_-14px_rgba(0,0,0,0.18)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-accent" />
              </span>

              <p className="text-sm font-bold text-content-primary">
                {isPreparing ? "Preparando grabación..." : "Grabando audio"}
              </p>

              <span className="rounded-full bg-accent/8 px-2.5 py-1 text-[11px] font-bold text-accent">
                {duration}
              </span>
            </div>

            <div className="relative h-[44px] w-full overflow-hidden rounded-2xl bg-surface-secondary px-3 py-[7px]">
              <div className="flex h-full items-end gap-[3px]">
                {Array.from({ length: emptySlots }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="min-w-0 flex-1 rounded-full bg-accent/10"
                    style={{ height: `${BASE_BAR_HEIGHT}px` }}
                  />
                ))}

                {waveformBars.map((height, index) => (
                  <div
                    key={`filled-${index}`}
                    className="min-w-0 flex-1 rounded-full bg-accent/78 transition-[height,opacity,transform] duration-75"
                    style={{
                      height: `${Math.min(height, 28)}px`,
                      maxHeight: "28px",
                      opacity: 0.55 + audioLevel * 0.45,
                      transform: `scaleY(${1 + audioLevel * 0.06})`,
                      transformOrigin: "bottom",
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-2 text-xs text-content-tertiary">
              Tu audio se está capturando localmente. Después podrás enviarlo al
              chat.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-border-default bg-surface-primary px-4 py-2 text-sm font-semibold text-content-secondary transition-all hover:border-border-default hover:bg-surface-secondary"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={onStop}
              className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-content-inverted transition-all hover:bg-accent-hover"
            >
              Detener
            </button>
          </div>
        </div>
      </div>
    </AnimatedEntrance>
  );
}
