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
            "bg-gradient-to-r from-[#0ea5e9] to-[#2563eb] shadow-[#2563eb]/25",
          disabled: false,
        }
      : variant === "disabled"
        ? {
            text: label ?? "Bloqueado",
            className: "bg-gray-200 text-gray-400 shadow-none",
            disabled: true,
          }
        : {
            text: label ?? "Comenzar",
            className:
              "bg-gradient-to-r from-[#993331] to-[#7a2826] shadow-[#993331]/30",
            disabled: false,
          };

  return (
    <motion.button
      whileTap={!config.disabled ? { scale: 0.98 } : undefined}
      onClick={!config.disabled ? onClick : undefined}
      disabled={config.disabled}
      className={[
        "w-full rounded-2xl py-4 text-[16px] font-extrabold text-white",
        "shadow-xl transition-all duration-200",
        config.className,
        config.disabled ? "cursor-not-allowed" : "hover:brightness-110",
      ].join(" ")}
    >
      {config.text}
    </motion.button>
  );
}
