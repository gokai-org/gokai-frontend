"use client";

interface ToggleProps {
  enabled?: boolean;
  onChange?: (enabled: boolean) => void;
  disabled?: boolean;
}

export function Toggle({
  enabled = false,
  onChange,
  disabled = false,
}: ToggleProps) {
  const handleToggle = () => {
    if (disabled) return;
    const newValue = !enabled;
    onChange?.(newValue);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={handleToggle}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${enabled ? "bg-gradient-to-r from-accent to-accent-hover" : "bg-content-muted/40"}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-content-inverted shadow-lg transition-transform duration-200 ease-in-out
          ${enabled ? "translate-x-6" : "translate-x-1"}
        `}
      />
    </button>
  );
}
