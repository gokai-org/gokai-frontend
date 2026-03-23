"use client";

import { motion } from "framer-motion";

export function PremiumStepIndicator() {
  return (
    <div className="mt-4 w-full max-w-xs mx-auto">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-[#993331]">Paso 1 de 3</span>
        <span className="text-xs font-medium text-neutral-400">Crear cuenta</span>
      </div>

      <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-[#993331]"
          initial={{ width: 0 }}
          animate={{ width: "33%" }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.3,
          }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between px-[2px]">
        {["Cuenta", "Pago", "Listo"].map((label, i) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div
              className={[
                "h-2 w-2 rounded-full transition-colors",
                i === 0 ? "bg-[#993331]" : "bg-neutral-200",
              ].join(" ")}
            />
            <span
              className={[
                "text-[10px] font-medium",
                i === 0 ? "text-[#993331]" : "text-neutral-300",
              ].join(" ")}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}