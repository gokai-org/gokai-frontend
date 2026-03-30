"use client";

import { motion } from "framer-motion";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={[
        "inline-flex items-center gap-2.5 select-none",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      {/* Hidden native input for accessibility + form */}
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />

      {/* Custom visual */}
      <motion.span
        whileTap={disabled ? {} : { scale: 0.85 }}
        className={[
          "relative flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border-2 transition-all duration-200",
          checked
            ? "border-accent bg-accent shadow-sm shadow-accent/25"
            : "border-border-default bg-surface-primary hover:border-accent/50",
        ].join(" ")}
      >
        {/* Checkmark */}
        <motion.svg
          initial={false}
          animate={
            checked ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }
          }
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="h-3 w-3 text-content-inverted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </motion.svg>

        {/* Ripple on check */}
        {checked && (
          <motion.span
            initial={{ scale: 0.4, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="absolute inset-0 rounded-[5px] bg-accent/20"
          />
        )}
      </motion.span>

      {label && (
        <span className="text-sm font-medium text-content-secondary">{label}</span>
      )}
    </label>
  );
}
