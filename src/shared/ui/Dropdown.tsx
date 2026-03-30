"use client";

import { useState, useRef, useEffect } from "react";

interface DropdownProps {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
  className?: string;
}

export function Dropdown({
  value,
  options,
  onChange,
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    setSelectedValue(option);
    onChange?.(option);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm bg-surface-primary border border-border-default rounded-lg hover:border-content-muted focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all"
      >
        <span className="text-content-secondary truncate pr-2">{selectedValue}</span>
        <svg
          className={`w-4 h-4 ml-2 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 bg-surface-elevated border border-border-default rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelect(option)}
              className={`w-full px-3 py-2 text-sm text-left hover:bg-surface-tertiary transition-colors ${
                selectedValue === option
                  ? "bg-accent-subtle text-accent font-medium"
                  : "text-content-secondary"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
