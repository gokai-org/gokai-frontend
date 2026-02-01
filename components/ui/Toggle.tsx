"use client";

import { useState } from "react";

interface ToggleProps {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ enabled = false, onChange, disabled = false }: ToggleProps) {
  const [isEnabled, setIsEnabled] = useState(enabled);

  const handleToggle = () => {
    if (disabled) return;
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onChange?.(newValue);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEnabled}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isEnabled ? 'bg-gradient-to-r from-[#993331] to-[#BA5149]' : 'bg-gray-300'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
}
