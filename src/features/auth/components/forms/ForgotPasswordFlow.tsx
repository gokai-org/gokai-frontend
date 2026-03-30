"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { VerificationCodeInputs } from "@/features/auth/components/VerificationCodeInputs";

type ForgotStep = "email" | "code" | "password";

type Props = {
  forgotStep: ForgotStep;
  forgotEmail: string;
  verificationCode: string[];
  newPassword: string;
  confirmNewPassword: string;
  showPass: boolean;
  showPass2: boolean;
  codeInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onForgotEmailChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmNewPasswordChange: (value: string) => void;
  onToggleShowPass: () => void;
  onToggleShowPass2: () => void;
  onCodeInput: (index: number, value: string) => void;
  onCodeKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  onSubmitEmail: (e: React.FormEvent) => void;
  onSubmitCode: (e: React.FormEvent) => void;
  onSubmitPassword: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
  onBackToEmail: () => void;
};

export function ForgotPasswordFlow({
  forgotStep,
  forgotEmail,
  verificationCode,
  newPassword,
  confirmNewPassword,
  showPass,
  showPass2,
  codeInputRefs,
  onForgotEmailChange,
  onNewPasswordChange,
  onConfirmNewPasswordChange,
  onToggleShowPass,
  onToggleShowPass2,
  onCodeInput,
  onCodeKeyDown,
  onSubmitEmail,
  onSubmitCode,
  onSubmitPassword,
  onBackToLogin,
  onBackToEmail,
}: Props) {
  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {forgotStep === "email" && (
          <motion.form
            key="email-step"
            onSubmit={onSubmitEmail}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-semibold text-content-secondary">
                Correo electrónico
              </label>
              <input
                value={forgotEmail}
                onChange={(e) => onForgotEmailChange(e.target.value)}
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2.5 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
                required
                autoComplete="email"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Enviar código
            </motion.button>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full text-center text-sm font-medium text-content-secondary hover:text-content-primary transition"
            >
              Volver a inicio de sesión
            </button>
          </motion.form>
        )}

        {forgotStep === "code" && (
          <motion.form
            key="code-step"
            onSubmit={onSubmitCode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <VerificationCodeInputs
              code={verificationCode}
              inputRefs={codeInputRefs}
              onInput={onCodeInput}
              onKeyDown={onCodeKeyDown}
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Verificar código
            </motion.button>

            <button
              type="button"
              onClick={onBackToEmail}
              className="w-full text-center text-sm font-medium text-content-secondary hover:text-content-primary transition"
            >
              Volver
            </button>
          </motion.form>
        )}

        {forgotStep === "password" && (
          <motion.form
            key="password-step"
            onSubmit={onSubmitPassword}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChange={onNewPasswordChange}
              show={showPass}
              onToggle={onToggleShowPass}
              placeholder="Nueva contraseña"
              autoComplete="new-password"
            />

            <PasswordField
              label="Confirmar nueva contraseña"
              value={confirmNewPassword}
              onChange={onConfirmNewPasswordChange}
              show={showPass2}
              onToggle={onToggleShowPass2}
              placeholder="Confirmar nueva contraseña"
              autoComplete="new-password"
            />

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200"
            >
              Cambiar contraseña
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}