"use client";

import { useCallback, useRef, useState } from "react";

const CODE_LEN = 6;

export type PasswordResetStep = "email" | "code" | "password";

interface Options {
  /** Pre-fill email (for modal where email is known). */
  email?: string;
  /** Called after password is successfully reset. */
  onSuccess?: () => void;
}

export function usePasswordResetFlow({ email: initialEmail = "", onSuccess }: Options = {}) {
  const [step, setStep] = useState<PasswordResetStep>("email");
  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(""));
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const reset = useCallback(() => {
    setStep("email");
    setLoading(false);
    setError(null);
    setCode(Array(CODE_LEN).fill(""));
    setNewPassword("");
    setConfirmPassword("");
    setShowPass(false);
    setShowPass2(false);
    setEmail(initialEmail);
  }, [initialEmail]);

  function handleCodeInput(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[index] = value;
    setCode(next);
    if (value && index < CODE_LEN - 1) codeRefs.current[index + 1]?.focus();
  }

  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "password-recovery" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar el código.");
      setStep("code");
      requestAnimationFrame(() => codeRefs.current[0]?.focus());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const joined = code.join("");
    if (joined.length < CODE_LEN) {
      setError("Ingresa el código completo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: joined, type: "password-recovery" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Código inválido o expirado.");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verification/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join(""), newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar la contraseña.");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return {
    step,
    setStep,
    email,
    setEmail,
    loading,
    error,
    clearError: () => setError(null),
    code,
    codeRefs,
    handleCodeInput,
    handleCodeKeyDown,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showPass,
    setShowPass,
    showPass2,
    setShowPass2,
    codeComplete: code.join("").length === CODE_LEN,
    reset,
  };
}
