"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/shared/ui/Checkbox";
import { PasswordField } from "@/features/auth/components/PasswordField";
import { GoogleLoginButton } from "@/features/auth/components/GoogleLoginButton";

type Props = {
  email: string;
  password: string;
  remember: boolean;
  showPass: boolean;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onRememberChange: (checked: boolean) => void;
  onToggleShowPass: () => void;
  onForgotPassword: () => void;
  onGoogleLogin: () => void;
  onGoToMembership: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function LoginForm({
  email,
  password,
  remember,
  showPass,
  loading,
  onEmailChange,
  onPasswordChange,
  onRememberChange,
  onToggleShowPass,
  onForgotPassword,
  onGoogleLogin,
  onGoToMembership,
  onSubmit,
}: Props) {
  return (
    <motion.form
      className="mt-5 space-y-3"
      onSubmit={onSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.3 }}
    >
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
          Correo
        </label>
        <input
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          type="email"
          placeholder="correo@ejemplo.com"
          className="w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2.5 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
          required
          autoComplete="email"
        />
      </div>

      <PasswordField
        label="Contraseña"
        value={password}
        onChange={onPasswordChange}
        show={showPass}
        onToggle={onToggleShowPass}
        placeholder="Contraseña"
        autoComplete="current-password"
      />

      <Checkbox
        id="remember"
        checked={remember}
        onChange={onRememberChange}
        label="Mantener sesión"
      />

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm font-semibold text-accent hover:underline transition"
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Iniciando..." : "Iniciar sesión"}
      </motion.button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-surface-tertiary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-content-muted">
          or
        </span>
        <div className="h-px flex-1 bg-surface-tertiary" />
      </div>

      <GoogleLoginButton onClick={onGoogleLogin} />

      <p className="pt-1 text-center text-sm font-medium text-content-secondary">
        ¿Necesitas una cuenta?{" "}
        <button
          type="button"
          onClick={onGoToMembership}
          className="font-semibold text-accent hover:underline"
        >
          Crear una cuenta
        </button>
      </p>
    </motion.form>
  );
}
