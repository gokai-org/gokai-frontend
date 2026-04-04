"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { usePasswordResetFlow } from "@/features/auth/hooks/usePasswordResetFlow";
import { PasswordResetStepHeader } from "@/features/auth/components/PasswordResetStepHeader";
import { VerificationCodeInputs } from "@/features/auth/components/VerificationCodeInputs";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { LoadingButton } from "@/shared/ui/LoadingButton";

const stepAnim = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.22 },
};

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  onPasswordChanged?: () => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
  onPasswordChanged,
}: ChangePasswordModalProps) {
  const flow = usePasswordResetFlow({
    email: userEmail,
    onSuccess: () => {
      onPasswordChanged?.();
      onClose();
    },
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) flow.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function handleClose() {
    flow.reset();
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-surface-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            className="relative z-10 w-full max-w-sm rounded-2xl bg-surface-elevated shadow-xl ring-1 ring-border-subtle overflow-hidden"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 26 }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-4 top-4 z-10 rounded-full p-1.5 text-content-tertiary hover:bg-surface-tertiary hover:text-content-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6">
              <PasswordResetStepHeader step={flow.step} email={userEmail} />

              <AnimatePresence mode="wait">
                {flow.step === "email" && (
                  <motion.form key="send" onSubmit={flow.handleSendCode} {...stepAnim} className="space-y-4">
                    <div className="rounded-lg border border-border-default bg-surface-secondary px-4 py-3">
                      <p className="text-xs text-content-tertiary mb-0.5">Se enviará a</p>
                      <p className="text-sm font-semibold text-content-primary truncate">{userEmail}</p>
                    </div>

                    {flow.error && <ErrorMsg>{flow.error}</ErrorMsg>}

                    <LoadingButton loading={flow.loading} loadingText="Enviando...">
                      Enviar código de verificación
                    </LoadingButton>
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

                    <button
                      type="button"
                      onClick={() => { flow.setStep("email"); flow.clearError(); }}
                      disabled={flow.loading}
                      className="w-full text-center text-xs font-medium text-content-tertiary hover:text-content-secondary transition disabled:opacity-50"
                    >
                      ← Volver / Reenviar código
                    </button>
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
                      Guardar nueva contraseña
                    </LoadingButton>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ErrorMsg({ children }: { children: string }) {
  return (
    <p className="text-xs text-status-error bg-status-error-subtle rounded-lg px-3 py-2">
      {children}
    </p>
  );
}
