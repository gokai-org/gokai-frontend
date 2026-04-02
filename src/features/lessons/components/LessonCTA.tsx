"use client";

import { motion } from "framer-motion";

type Props = {
  variant?: "start" | "complete" | "disabled";
  onClick?: () => void;
  label?: string;
};

export default function LessonCTA({
  variant = "start",
  onClick,
  label,
}: Props) {
  const config =
    variant === "complete"
      ? {
          text: label ?? "Completar",
          className:
            "bg-gradient-to-r from-[#6e2220] to-accent-hover shadow-accent/30",
          disabled: false,
        }
      : variant === "disabled"
        ? {
            text: label ?? "Bloqueado",
            className: "bg-surface-tertiary text-content-muted shadow-none",
            disabled: true,
          }
        : {
            text: label ?? "Comenzar",
            className:
              "bg-gradient-to-r from-accent to-accent-hover shadow-accent/30",
            disabled: false,
          };

  return (
    <motion.button
      whileTap={!config.disabled ? { scale: 0.98 } : undefined}
      onClick={!config.disabled ? onClick : undefined}
      disabled={config.disabled}
      className={[
        "w-full rounded-2xl py-4 text-[16px] font-extrabold text-content-inverted",
        "shadow-xl transition-all duration-200",
        config.className,
        config.disabled ? "cursor-not-allowed" : "hover:brightness-110",
      ].join(" ")}
    >
      {config.text}
    </motion.button>
  );
}
