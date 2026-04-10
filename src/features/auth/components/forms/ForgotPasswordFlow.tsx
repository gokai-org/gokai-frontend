"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePasswordResetFlow } from "@/features/auth/hooks/usePasswordResetFlow";
import { VerificationCodeInputs } from "@/features/auth/components/VerificationCodeInputs";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { LoadingButton } from "@/shared/ui/LoadingButton";

interface Props {
  onSuccess: () => void;
  onBack: () => void;
}

const stepAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.25 },
};

export function ForgotPasswordFlow({ onSuccess, onBack }: Props) {
  const flow = usePasswordResetFlow({ onSuccess });

  return (
    <motion.div
      className="mt-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {flow.step === "email" && (
          <motion.form key="email" onSubmit={flow.handleSendCode} {...stepAnim} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-content-secondary">
                Correo electrónico
              </label>
              <input
                value={flow.email}
                onChange={(e) => flow.setEmail(e.target.value)}
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2.5 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
                required
                autoComplete="email"
                disabled={flow.loading}
              />
            </div>

            {flow.error && <ErrorMsg>{flow.error}</ErrorMsg>}

            <LoadingButton loading={flow.loading} loadingText="Enviando código...">
              Enviar código
            </LoadingButton>

            <BackButton onClick={onBack} disabled={flow.loading}>
              ← Volver a inicio de sesión
            </BackButton>
          </motion.form>
        )}

        {flow.step === "code" && (
          <motion.form key="code" onSubmit={flow.handleVerifyCode} {...stepAnim} className="space-y-4">
            <VerificationCodeInputs
              code={flow.code}
              inputRefs={flow.codeRefs}
              onInput={flow.handleCodeInput}
              onKeyDown={flow.handleCodeKeyDown}
            />

            {flow.error && <ErrorMsg>{flow.error}</ErrorMsg>}

            <LoadingButton loading={flow.loading} disabled={!flow.codeComplete} loadingText="Verificando...">
              Verificar código
            </LoadingButton>

            <BackButton
              onClick={() => { flow.setStep("email"); flow.clearError(); }}
              disabled={flow.loading}
            >
              ← Volver
            </BackButton>
          </motion.form>
        )}

        {flow.step === "password" && (
          <motion.form key="password" onSubmit={flow.handleResetPassword} {...stepAnim} className="space-y-4">
            <PasswordField
              label="Nueva contraseña"
              value={flow.newPassword}
              onChange={flow.setNewPassword}
              show={flow.showPass}
              onToggle={() => flow.setShowPass((s) => !s)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirmar contraseña"
              value={flow.confirmPassword}
              onChange={flow.setConfirmPassword}
              show={flow.showPass2}
              onToggle={() => flow.setShowPass2((s) => !s)}
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />

            {flow.error && <ErrorMsg>{flow.error}</ErrorMsg>}

            <LoadingButton loading={flow.loading} loadingText="Guardando...">
              Cambiar contraseña
            </LoadingButton>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ErrorMsg({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-status-error bg-status-error-subtle rounded-lg px-3 py-2">
      {children}
    </p>
  );
}

function BackButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-center text-sm font-medium text-content-secondary hover:text-content-primary transition disabled:opacity-50"
    >
      {children}
    </button>
  );
}