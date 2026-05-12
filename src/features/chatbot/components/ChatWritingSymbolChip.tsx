"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import type { ChatWritingTarget } from "@/features/chatbot/hooks/useChatWritingPractice";
import { getWritingPalette } from "@/features/chatbot/utils/writingPalette";
import { useTheme } from "@/shared/hooks/useTheme";

type SymbolPopoverPosition = {
  top: number;
  left: number;
  arrowLeft: number;
  placement: "top" | "bottom";
};

interface ChatWritingSymbolChipProps {
  target: ChatWritingTarget;
  selected: boolean;
  onSelect: () => void;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStatusLabel(target: ChatWritingTarget) {
  switch (target.status) {
    case "available":
      return "Disponible";
    case "locked":
      return "Aun no disponible";
    case "upcoming":
      return "Proximamente";
    default:
      return "Sin estado";
  }
}

export function ChatWritingSymbolChip({
  target,
  selected,
  onSelect,
}: ChatWritingSymbolChipProps) {
  const { theme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [position, setPosition] = useState<SymbolPopoverPosition | null>(null);
  const [canHoverPopover, setCanHoverPopover] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(hover: hover) and (pointer: fine)").matches
      : false,
  );

  const palette = getWritingPalette(target.accentColor);
  const accent = palette.accent;
  const isDark = theme === "dark";

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openPopover = useCallback(
    (sticky: boolean) => {
      clearCloseTimer();
      setIsSticky(sticky);
      setIsActive(true);
    },
    [clearCloseTimer],
  );

  const scheduleClose = useCallback(() => {
    if (!isActive || isSticky) {
      return;
    }

    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setIsActive(false);
      closeTimerRef.current = null;
    }, 90);
  }, [clearCloseTimer, isActive, isSticky]);

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setCanHoverPopover(media.matches);
      if (media.matches && isSticky) {
        setIsSticky(false);
      }
    };

    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [isSticky]);

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Element &&
        event.target.closest("[data-chat-writing-popover-root='true']")
      ) {
        return;
      }

      setIsActive(false);
      setIsSticky(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsActive(false);
        setIsSticky(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  useLayoutEffect(() => {
    if (!isActive) {
      return;
    }

    const updatePosition = () => {
      const anchor = buttonRef.current;
      const popover = popoverRef.current;

      if (!anchor || !popover) {
        return;
      }

      const anchorRect = anchor.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const padding = 12;
      const gap = 10;
      const fitsAbove = anchorRect.top >= popoverRect.height + gap + padding;
      const fitsBelow =
        viewportHeight - anchorRect.bottom >= popoverRect.height + gap + padding;
      const placement: "top" | "bottom" =
        fitsAbove || !fitsBelow ? "top" : "bottom";
      const desiredLeft =
        anchorRect.left + anchorRect.width / 2 - popoverRect.width / 2;
      const left = clamp(
        desiredLeft,
        padding,
        Math.max(padding, viewportWidth - popoverRect.width - padding),
      );
      const desiredTop =
        placement === "top"
          ? anchorRect.top - popoverRect.height - gap
          : anchorRect.bottom + gap;
      const top = clamp(
        desiredTop,
        padding,
        Math.max(padding, viewportHeight - popoverRect.height - padding),
      );
      const arrowLeft = clamp(
        anchorRect.left + anchorRect.width / 2 - left,
        18,
        Math.max(18, popoverRect.width - 18),
      );

      setPosition({ top, left, arrowLeft, placement });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isActive]);

  return (
    <div data-chat-writing-popover-root="true" className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        aria-label={target.title}
        aria-expanded={isActive}
        onClick={onSelect}
        onPointerEnter={(event) => {
          if (canHoverPopover && event.pointerType === "mouse") {
            openPopover(false);
          }
        }}
        onPointerLeave={(event) => {
          if (canHoverPopover && event.pointerType === "mouse") {
            scheduleClose();
          }
        }}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse" || !canHoverPopover) {
            setIsActive((current) => !current);
            setIsSticky(true);
          }
        }}
        onFocus={() => {
          clearCloseTimer();
          setIsSticky(true);
          setIsActive(true);
        }}
        className="flex h-11 min-w-11 items-center justify-center rounded-2xl border px-3 text-lg font-black transition hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 jp-text"
        style={{
          color: accent,
          borderColor: selected
            ? palette.borderStrong
            : palette.borderSoft,
          backgroundColor: selected
            ? palette.softStrong
            : palette.soft,
          boxShadow: selected
            ? `0 10px 24px -18px ${palette.glow}`
            : "none",
          opacity: target.status === "available" ? 1 : 0.62,
        }}
      >
        {target.symbol}
      </button>

      {isActive && typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed inset-0 z-[90]">
              <motion.div
                ref={popoverRef}
                initial={{
                  opacity: 0,
                  y: position?.placement === "bottom" ? -6 : 6,
                  scale: 0.98,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: position?.placement === "bottom" ? -4 : 4,
                  scale: 0.98,
                }}
                transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-auto fixed w-[min(18rem,calc(100vw-1.5rem))]"
                style={{
                  top: position?.top ?? -9999,
                  left: position?.left ?? -9999,
                }}
                onMouseEnter={clearCloseTimer}
                onMouseLeave={() => {
                  if (canHoverPopover) {
                    scheduleClose();
                  }
                }}
              >
                <div className="relative overflow-visible">
                  <div
                    className="overflow-hidden rounded-2xl border shadow-xl ring-1"
                    style={{
                      borderColor: palette.borderSoft,
                      backgroundColor: isDark ? "#101010" : "#ffffff",
                      color: isDark ? "#f5f5f5" : "#0f172a",
                      boxShadow: isDark
                        ? "0 18px 36px rgba(0,0,0,0.48)"
                        : "0 18px 36px rgba(15,23,42,0.12)",
                    }}
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl font-black jp-text"
                        style={{
                          color: accent,
                          backgroundColor: palette.softStrong,
                        }}
                      >
                        {target.symbol}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[10px] font-black uppercase tracking-[0.18em]"
                          style={{ color: palette.symbolMuted }}
                        >
                          {getStatusLabel(target)}
                        </p>
                        <p
                          className="mt-0.5 text-sm font-black"
                          style={{ color: isDark ? "#f5f5f5" : "#0f172a" }}
                        >
                          {target.title}
                        </p>
                      </div>
                    </div>
                    <div
                      className="border-t px-3 py-2.5"
                      style={{
                        borderColor: palette.borderSoft,
                        backgroundColor: palette.soft,
                      }}
                    >
                      <p
                        className="text-xs font-semibold leading-relaxed"
                        style={{ color: isDark ? "#d4d4d8" : "#334155" }}
                      >
                        {target.helper}
                      </p>
                    </div>
                  </div>
                  {position ? (
                    <div
                      className={[
                        "absolute h-3 w-3 rotate-45",
                        position.placement === "top"
                          ? "-bottom-1.5 border-b border-r"
                          : "-top-1.5 border-l border-t",
                      ].join(" ")}
                      style={{
                        left: position.arrowLeft - 6,
                        borderColor: palette.borderSoft,
                        backgroundColor: isDark ? "#101010" : "#ffffff",
                      }}
                    />
                  ) : null}
                </div>
              </motion.div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}