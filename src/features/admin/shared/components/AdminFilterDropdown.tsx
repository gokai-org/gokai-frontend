"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface AdminFilterOption<T extends string = string> {
  value: T;
  label: string;
}

interface AdminFilterDropdownProps<T extends string = string> {
  value: T;
  options: ReadonlyArray<AdminFilterOption<T>>;
  onChange: (value: T) => void;
  buttonLabel?: string;
  className?: string;
  fullWidth?: boolean;
  menuAlign?: "left" | "right";
  menuDirection?: "up" | "down";
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
}: AdminFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected =
    options.find((option) => option.value === value) ?? options[0] ?? null;

  useEffect(() => {
    if (!open) return;

    const onOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target as Node)) {
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

  if (!selected) return null;

  return (
    <div ref={containerRef} className={["relative", className ?? ""].join(" ")}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={[
          "inline-flex h-10 min-w-[240px] items-center justify-between gap-2 rounded-full border border-border-default bg-surface-primary px-4 text-sm font-semibold text-content-secondary transition-all hover:border-accent/30 hover:text-accent",
          fullWidth ? "w-full" : "",
        ].join(" ")}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="whitespace-nowrap">
          {buttonLabel ?? selected.label}
        </span>
        <ChevronDown
          className={[
            "h-4 w-4 shrink-0 transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div
          className={[
            "absolute z-20 min-w-[280px] overflow-hidden rounded-2xl border border-border-default bg-surface-primary p-1.5 shadow-xl",
            menuAlign === "left" ? "left-0" : "right-0",
            menuDirection === "up" ? "bottom-full mb-2" : "top-full mt-2",
          ].join(" ")}
          role="listbox"
        >
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
      )}
    </div>
  );
}
