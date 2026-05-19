"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface AdminFilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface AdminFilterDropdownProps<T extends string = string> {
  value: T | null | undefined;
  options: ReadonlyArray<AdminFilterOption<T>>;
  onChange: (value: T) => void;
  buttonLabel?: string;
  className?: string;
  fullWidth?: boolean;
  menuAlign?: "left" | "right";
  menuDirection?: "up" | "down";
  disabled?: boolean;
  maxMenuHeight?: number;
}

export function AdminFilterDropdown<T extends string = string>({
  value,
  options,
  onChange,
  buttonLabel,
  className,
  fullWidth = false,
  menuAlign = "right",
  menuDirection = "down",
  disabled = false,
  maxMenuHeight,
}: AdminFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const selected = options.find((option) => option.value === value) ?? null;

  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (
        !containerRef.current.contains(event.target as Node) &&
        !menuRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("mousedown", onOutsideClick);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("mousedown", onOutsideClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    const container = containerRef.current;
    const menu = menuRef.current;
    if (!container || !menu || typeof window === "undefined") {
      return;
    }

    const gap = 8;
    const viewportPadding = 12;
    const containerRect = container.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const width = containerRect.width;
    const spaceBelow = window.innerHeight - containerRect.bottom - viewportPadding;
    const spaceAbove = containerRect.top - viewportPadding;
    const nextDirection =
      menuDirection === "down" && menuRect.height > spaceBelow && spaceAbove > spaceBelow
        ? "up"
        : menuDirection === "up" && menuRect.height > spaceAbove && spaceBelow > spaceAbove
          ? "down"
          : menuDirection;

    const availableHeight =
      nextDirection === "up"
        ? Math.max(spaceAbove - gap, 160)
        : Math.max(spaceBelow - gap, 160);

    const nextMaxHeight = maxMenuHeight
      ? Math.min(availableHeight, maxMenuHeight)
      : availableHeight;

    const preferredLeft =
      menuAlign === "left"
        ? containerRect.left
        : containerRect.right - width;
    const clampedLeft = Math.min(
      Math.max(preferredLeft, viewportPadding),
      window.innerWidth - width - viewportPadding,
    );

    menu.style.width = `${width}px`;
    menu.style.left = `${clampedLeft}px`;
    menu.style.maxHeight = `${nextMaxHeight}px`;
    menu.style.visibility = "visible";
    if (nextDirection === "up") {
      menu.style.top = "auto";
      menu.style.bottom = `${window.innerHeight - containerRect.top + gap}px`;
      return;
    }

    menu.style.bottom = "auto";
    menu.style.top = `${Math.min(
      containerRect.bottom + gap,
      window.innerHeight - nextMaxHeight - viewportPadding,
    )}px`;
  }, [maxMenuHeight, menuAlign, menuDirection, open, options.length]);

  if (!selected && !buttonLabel) return null;

  return (
    <div
      ref={containerRef}
      className={[
        fullWidth ? "relative isolate z-[70] block" : "relative isolate z-[70] inline-block",
        className ?? "",
      ].join(" ")}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "inline-flex h-10 min-w-[240px] items-center justify-between gap-2 rounded-full border border-border-default bg-surface-primary px-4 text-sm font-semibold text-content-secondary transition-all hover:border-accent/30 hover:text-accent disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border-default disabled:hover:text-content-secondary",
          fullWidth ? "w-full" : "",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="whitespace-nowrap">
          {buttonLabel ?? selected?.label ?? ""}
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && !disabled && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="fixed z-[140] overflow-hidden rounded-2xl border border-border-default bg-surface-primary p-1.5 shadow-xl"
              style={{ visibility: "hidden" }}
              role="listbox"
            >
              <div className="max-h-full overflow-y-auto">
                {options.map((option) => {
                  const active = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors",
                        active
                          ? "bg-accent/10 text-accent"
                          : "text-content-secondary hover:bg-surface-secondary",
                      ].join(" ")}
                    >
                      <span className="whitespace-nowrap font-medium">
                        {option.label}
                      </span>
                      {active && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
