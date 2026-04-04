"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── helpers ─── */
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
const DAYS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfMonth(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function formatDisplay(date: Date) {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function toISO(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/* types */
interface DatePickerProps {
  value: string;
  onChange: (iso: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  maxDate?: Date;
  minDate?: Date;
}

type ViewMode = "days" | "months" | "years";

/* component*/
export function DatePicker({
  value,
  onChange,
  placeholder = "dd/mm/aaaa",
  required,
  className = "",
  maxDate,
  minDate,
}: DatePickerProps) {
  const parsed = value ? new Date(value + "T00:00:00") : null;
  const today = new Date();

  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("days");
  const [viewYear, setViewYear] = useState(
    parsed?.getFullYear() ?? today.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState(
    parsed?.getMonth() ?? today.getMonth(),
  );
  const [yearsPage, setYearsPage] = useState(0); // for paging through years

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [insideForceLight, setInsideForceLight] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      if (containerRef.current?.closest(".force-light")) {
        setInsideForceLight(true);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    function updatePos() {
      const rect = triggerRef.current!.getBoundingClientRect();
      const dropW = 280;
      const dropH = 340;
      let left = rect.left + rect.width / 2 - dropW / 2;
      if (left < 8) left = 8;
      if (left + dropW > window.innerWidth - 8)
        left = window.innerWidth - 8 - dropW;

      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropH && rect.top > dropH;

      setDropdownPos({
        top: openAbove
          ? rect.top - dropH - 8 + window.scrollY
          : rect.bottom + 8 + window.scrollY,
        left: left + window.scrollX,
      });
    }
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  /* close on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inDropdown = dropdownRef.current?.contains(target);
      if (!inTrigger && !inDropdown) {
        setOpen(false);
        setViewMode("days");
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = useCallback(
    (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      onChange(toISO(d));
      setOpen(false);
      setViewMode("days");
    },
    [viewYear, viewMonth, onChange],
  );

  function handleMonthSelect(m: number) {
    setViewMonth(m);
    setViewMode("days");
  }

  function handleYearSelect(y: number) {
    setViewYear(y);
    setViewMode("months");
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  /* ── build calendar grid ── */
  const totalDays = daysInMonth(viewYear, viewMonth);
  const startDay = startDayOfMonth(viewYear, viewMonth);

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);

  function isSelected(day: number) {
    if (!parsed) return false;
    return (
      parsed.getFullYear() === viewYear &&
      parsed.getMonth() === viewMonth &&
      parsed.getDate() === day
    );
  }

  function isToday(day: number) {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  }

  function isDayDisabled(day: number) {
    const d = new Date(viewYear, viewMonth, day);
    if (maxDate && d > maxDate) return true;
    if (minDate && d < minDate) return true;
    return false;
  }

  /* ── years grid ── */
  const YEARS_PER_PAGE = 12;
  const baseYear = today.getFullYear() - 100 + yearsPage * YEARS_PER_PAGE;
  const yearsGrid = Array.from(
    { length: YEARS_PER_PAGE },
    (_, i) => baseYear + i,
  );

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!open) {
            // Reset view to selected date or today
            setViewYear(parsed?.getFullYear() ?? today.getFullYear());
            setViewMonth(parsed?.getMonth() ?? today.getMonth());
            setViewMode("days");
            setYearsPage(
              Math.floor(
                ((parsed?.getFullYear() ?? today.getFullYear()) -
                  (today.getFullYear() - 100)) /
                  YEARS_PER_PAGE,
              ),
            );
          }
          setOpen((o) => !o);
        }}
        className={[
          "w-full flex items-center justify-between rounded-lg border bg-surface-primary px-3 py-2 text-sm outline-none transition",
          open
            ? "border-accent/40 ring-4 ring-accent/10"
            : "border-border-default hover:border-border-default",
          value ? "text-content-primary" : "text-content-muted",
        ].join(" ")}
      >
        <span>{parsed ? formatDisplay(parsed) : placeholder}</span>
        {/* Calendar icon */}
        <svg
          className="h-4 w-4 text-content-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* Hidden native input for form validation */}
      {required && (
        <input
          type="text"
          value={value}
          required
          tabIndex={-1}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Dropdown (portal) */}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && dropdownPos && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`fixed z-[9999] w-[280px] rounded-xl border border-border-subtle bg-surface-primary p-3 shadow-lg shadow-neutral-900/10 ring-1 ring-border-subtle${insideForceLight ? " force-light" : ""}`}
                style={{ top: dropdownPos.top, left: dropdownPos.left }}
              >
                <AnimatePresence mode="wait">
                  {/* ─── DAYS VIEW ─── */}
                  {viewMode === "days" && (
                    <motion.div
                      key="days"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {/* Header: nav + month/year label */}
                      <div className="mb-2 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-content-tertiary transition hover:bg-surface-tertiary hover:text-content-primary"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={() => setViewMode("months")}
                          className="rounded-md px-2 py-1 text-sm font-semibold text-content-primary transition hover:bg-accent/10 hover:text-accent"
                        >
                          {MONTHS[viewMonth]} {viewYear}
                        </button>

                        <button
                          type="button"
                          onClick={nextMonth}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-content-tertiary transition hover:bg-surface-tertiary hover:text-content-primary"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>

                      {/* Day names */}
                      <div className="mb-1 grid grid-cols-7 gap-0">
                        {DAYS.map((d) => (
                          <div
                            key={d}
                            className="py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-content-muted"
                          >
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-0">
                        {cells.map((day, i) => {
                          if (day === null) return <div key={`empty-${i}`} />;
                          const selected = isSelected(day);
                          const todayMark = isToday(day);
                          const disabled = isDayDisabled(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={disabled}
                              onClick={() => handleSelect(day)}
                              className={[
                                "relative mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all duration-150",
                                disabled
                                  ? "cursor-not-allowed text-content-muted"
                                  : selected
                                    ? "bg-accent text-content-inverted shadow-sm shadow-accent/30"
                                    : todayMark
                                      ? "bg-accent/10 text-accent font-bold"
                                      : "text-content-secondary hover:bg-accent/8 hover:text-accent",
                              ].join(" ")}
                            >
                              {day}
                              {todayMark && !selected && (
                                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Today shortcut */}
                      <div className="mt-2 flex justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setViewYear(today.getFullYear());
                            setViewMonth(today.getMonth());
                            handleSelect(today.getDate());
                          }}
                          className="rounded-md px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/10"
                        >
                          Hoy
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── MONTHS VIEW ─── */}
                  {viewMode === "months" && (
                    <motion.div
                      key="months"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="mb-3 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setViewMode("years")}
                          className="rounded-md px-3 py-1 text-sm font-semibold text-content-primary transition hover:bg-accent/10 hover:text-accent"
                        >
                          {viewYear}
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {MONTHS.map((m, i) => {
                          const isCurrent =
                            i === viewMonth &&
                            viewYear === (parsed?.getFullYear() ?? -1);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => handleMonthSelect(i)}
                              className={[
                                "rounded-lg py-2 text-sm font-medium transition-all duration-150",
                                isCurrent
                                  ? "bg-accent text-content-inverted shadow-sm shadow-accent/25"
                                  : "text-content-secondary hover:bg-accent/8 hover:text-accent",
                              ].join(" ")}
                            >
                              {m.slice(0, 3)}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── YEARS VIEW ─── */}
                  {viewMode === "years" && (
                    <motion.div
                      key="years"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setYearsPage((p) => Math.max(0, p - 1))
                          }
                          className="flex h-7 w-7 items-center justify-center rounded-md text-content-tertiary transition hover:bg-surface-tertiary"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 19l-7-7 7-7"
                            />
                          </svg>
                        </button>
                        <span className="text-sm font-semibold text-content-secondary">
                          {yearsGrid[0]} – {yearsGrid[yearsGrid.length - 1]}
                        </span>
                        <button
                          type="button"
                          onClick={() => setYearsPage((p) => p + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md text-content-tertiary transition hover:bg-surface-tertiary"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {yearsGrid.map((y) => {
                          const isCurrent = y === viewYear;
                          return (
                            <button
                              key={y}
                              type="button"
                              onClick={() => handleYearSelect(y)}
                              className={[
                                "rounded-lg py-2 text-sm font-medium transition-all duration-150",
                                isCurrent
                                  ? "bg-accent text-content-inverted shadow-sm shadow-accent/25"
                                  : "text-content-secondary hover:bg-accent/8 hover:text-accent",
                              ].join(" ")}
                            >
                              {y}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
