"use client";

import type { CSSProperties } from "react";
import { CheckCircle2 } from "lucide-react";
import { MASTERY_GOLD } from "@/features/mastery/utils/masteryColors";

export type AnswerConfirmationTone = "hiragana" | "katakana" | "kanji" | "grammar";

type AnswerConfirmationPalette = {
  from: string;
  to: string;
  base: string;
  shadow: string;
};

const CONFIRMATION_PALETTES: Record<AnswerConfirmationTone, AnswerConfirmationPalette> = {
  hiragana: {
    from: "#7B3F8A",
    to: "#A866B5",
    base: "#7B3F8A",
    shadow: "#7B3F8A",
  },
  katakana: {
    from: "#1B5078",
    to: "#2E82B5",
    base: "#1B5078",
    shadow: "#1B5078",
  },
  kanji: {
    from: "#993331",
    to: "#BA5149",
    base: "#993331",
    shadow: "#993331",
  },
  grammar: {
    from: "#993331",
    to: "#BA5149",
    base: "#993331",
    shadow: "#993331",
  },
};

const MASTERY_PALETTE: AnswerConfirmationPalette = {
  from: MASTERY_GOLD.gradientFrom,
  to: MASTERY_GOLD.gradientTo,
  base: MASTERY_GOLD.primary,
  shadow: MASTERY_GOLD.shadow,
};

function hexToRgba(hex: string, alpha: number): string {
  const sanitized = hex.replace("#", "");
  const normalized = sanitized.length === 3
    ? sanitized
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : sanitized;

  const value = Number.parseInt(normalized, 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

type AnswerConfirmationPanelAction = {
  label: string;
  onAction: () => void;
  disabled?: boolean;
};

interface AnswerConfirmationPanelProps {
  title?: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  disabled?: boolean;
  secondaryAction?: AnswerConfirmationPanelAction | null;
  tone?: AnswerConfirmationTone;
  mastered?: boolean;
}

export function AnswerConfirmationPanel({
  title = "Respuesta lista",
  description,
  confirmLabel = "Confirmar respuesta",
  onConfirm,
  disabled = false,
  secondaryAction = null,
  tone = "kanji",
  mastered = false,
}: AnswerConfirmationPanelProps) {
  const palette = mastered ? MASTERY_PALETTE : CONFIRMATION_PALETTES[tone];

  const panelStyle: CSSProperties = {
    borderColor: hexToRgba(palette.base, mastered ? 0.3 : 0.14),
  };

  const iconStyle: CSSProperties = {
    backgroundColor: hexToRgba(palette.base, mastered ? 0.2 : 0.12),
    color: palette.base,
  };

  const secondaryStyle: CSSProperties = {
    borderColor: hexToRgba(palette.base, mastered ? 0.24 : 0.16),
    backgroundColor: hexToRgba(palette.base, mastered ? 0.14 : 0.07),
    color: palette.base,
  };

  const confirmStyle: CSSProperties = disabled
    ? {
        background: hexToRgba(palette.base, 0.18),
        boxShadow: "none",
      }
    : mastered
      ? {
          background: `linear-gradient(135deg, ${MASTERY_GOLD.gradientFrom}, ${MASTERY_GOLD.gradientTo})`,
          boxShadow: `0 12px 28px ${MASTERY_GOLD.glow}`,
        }
    : {
        backgroundColor: palette.base,
        boxShadow: "none",
      };

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border bg-white p-3.5 shadow-[0_16px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:bg-[#101010] dark:shadow-[0_20px_40px_rgba(0,0,0,0.42)] sm:p-4"
      style={panelStyle}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ backgroundColor: hexToRgba(palette.base, mastered ? 0.24 : 0.1) }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px]"
          style={iconStyle}
        >
          <CheckCircle2 className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <p
                className="text-[10px] font-black uppercase tracking-[0.18em]"
                style={{ color: mastered ? hexToRgba(palette.base, 0.92) : hexToRgba(palette.base, 0.82) }}
              >
                {title}
              </p>
              <p className="text-sm leading-5 text-content-secondary dark:text-[#d6d0ca]">
                {description}
              </p>
            </div>

            {mastered ? (
              <span
                className="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]"
                style={secondaryStyle}
              >
                Maestria
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {secondaryAction ? (
              <button
                type="button"
                onClick={secondaryAction.onAction}
                disabled={secondaryAction.disabled}
                className="inline-flex min-h-9 items-center justify-center rounded-full border px-3.5 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                style={secondaryStyle}
              >
                {secondaryAction.label}
              </button>
            ) : null}

            <button
              type="button"
              disabled={disabled}
              onClick={onConfirm}
              className="inline-flex min-h-9 items-center justify-center rounded-full px-3.5 py-2 text-xs font-bold text-white transition hover:-translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0"
              style={confirmStyle}
            >
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
