"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

interface PrimaryActionButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
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
        "bg-gradient-to-r from-[#993331] to-[#7a2927]",
        "px-5 py-3 text-sm font-bold text-white",
        "shadow-lg shadow-[#993331]/20",
        "transition-all duration-300",
        "hover:shadow-xl hover:shadow-[#993331]/25",
        "hover:-translate-y-[1px] active:translate-y-0",
        "focus:outline-none focus:ring-2 focus:ring-[#993331]/20",
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