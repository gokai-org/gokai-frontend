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
}

export function AdminFilterDropdown<T extends string = string>({
  value,
  options,
  onChange,
  buttonLabel,
  className,
}: AdminFilterDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selected =
    options.find((option) => option.value === value) ?? options[0] ?? null;

  useEffect(() => {
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
  }, []);

  if (!selected) return null;

  return (
    <div ref={containerRef} className={["relative", className ?? ""].join(" ")}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition-all hover:border-[#993331]/30 hover:text-[#993331]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {buttonLabel ?? selected.label}
        <ChevronDown
          className={["h-4 w-4 transition-transform", open ? "rotate-180" : ""].join(" ")}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 z-20 mt-2 min-w-[190px] overflow-hidden rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl"
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
                    ? "bg-[#993331]/10 text-[#993331]"
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")}
              >
                <span className="font-medium">{option.label}</span>
                {active && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
