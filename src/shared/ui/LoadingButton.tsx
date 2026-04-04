"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

interface LoadingButtonProps {
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  type?: "submit" | "button";
  className?: string;
  onClick?: () => void;
  children: ReactNode;
}

export function LoadingButton({
  loading = false,
  disabled,
  loadingText = "Cargando...",
  type = "submit",
  className = "w-full flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70",
  onClick,
  children,
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <motion.button
      type={type}
      disabled={isDisabled}
      whileHover={{ scale: isDisabled ? 1 : 1.02 }}
      whileTap={{ scale: isDisabled ? 1 : 0.98 }}
      className={className}
      onClick={onClick}
    >
      {loading ? (
        <>
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
