"use client";

import React from "react";
import { motion } from "framer-motion";
import { VerificationCodeInputs } from "@/features/auth/components/VerificationCodeInputs";

type Props = {
  regEmail: string;
  regVerificationCode: string[];
  regCodeInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onRegCodeInput: (index: number, value: string) => void;
  onRegCodeKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
};

export function RegisterVerifyForm({
  regEmail,
  regVerificationCode,
  regCodeInputRefs,
  onRegCodeInput,
  onRegCodeKeyDown,
  onSubmit,
  onResend,
  onBack,
}: Props) {
  return (
    <motion.form
      key="verify-email"
      className="space-y-4"
      onSubmit={onSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <p className="text-sm text-neutral-500">
          Ingresa el código enviado a{" "}
          <span className="font-semibold text-neutral-700">
            {regEmail || "tu correo"}
          </span>
        </p>
      </div>

      <VerificationCodeInputs
        code={regVerificationCode}
        inputRefs={regCodeInputRefs}
        onInput={onRegCodeInput}
        onKeyDown={onRegCodeKeyDown}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={onResend}
          className="text-sm font-medium text-neutral-600 hover:text-[#993331] transition"
        >
          ¿No recibiste el código? <span className="font-semibold">Reenviar</span>
        </button>
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200"
      >
        Verificar correo
      </motion.button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
      >
        Volver
      </button>
    </motion.form>
  );
}