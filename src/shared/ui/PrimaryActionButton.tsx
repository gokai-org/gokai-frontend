"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function PrimaryActionButton({
  children,
  icon,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: PrimaryActionButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full",
        "bg-gradient-to-r from-accent to-accent-hover dark:to-accent-hover",
        "px-5 py-3 text-sm font-bold text-content-inverted",
        "shadow-lg shadow-accent/20",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-accent/25",
        "hover:-translate-y-[1px] active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-accent/20",
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-lg",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      <span>{children}</span>
      {icon ? icon : <span aria-hidden="true">→</span>}
    </button>
  );
}
