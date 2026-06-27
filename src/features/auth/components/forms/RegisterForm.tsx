"use client";

import { motion } from "framer-motion";
import { DatePicker } from "@/shared/ui/DatePicker";
import { Checkbox } from "@/shared/ui/Checkbox";
import { PasswordField } from "@/features/auth/components/PasswordField";

type Props = {
  firstName: string;
  lastName: string;
  regEmail: string;
  birthdate: string;
  isUnderMinimumAge: boolean;
  requiresGuardianConsent: boolean;
  regPassword: string;
  regPassword2: string;
  fromGoogle: boolean;
  showPass: boolean;
  showPass2: boolean;
  acceptedTerms: boolean;
  legalAcceptanceState: {
    privacy: boolean;
    terms: boolean;
  };
  guardianConsent: boolean;
  loading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onRegEmailChange: (value: string) => void;
  onBirthdateChange: (value: string) => void;
  onRegPasswordChange: (value: string) => void;
  onRegPassword2Change: (value: string) => void;
  onGuardianConsentChange: (value: boolean) => void;
  onOpenLegalDocument: (document?: "terms" | "privacy") => void;
  onToggleShowPass: () => void;
  onToggleShowPass2: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function RegisterForm({
  firstName,
  lastName,
  regEmail,
  birthdate,
  isUnderMinimumAge,
  requiresGuardianConsent,
  regPassword,
  regPassword2,
  fromGoogle,
  showPass,
  showPass2,
  acceptedTerms,
  legalAcceptanceState,
  guardianConsent,
  loading,
  onFirstNameChange,
  onLastNameChange,
  onRegEmailChange,
  onBirthdateChange,
  onRegPasswordChange,
  onRegPassword2Change,
  onGuardianConsentChange,
  onOpenLegalDocument,
  onToggleShowPass,
  onToggleShowPass2,
  onSubmit,
}: Props) {
  return (
    <motion.form
      key="register-form"
      className="space-y-2.5"
      onSubmit={onSubmit}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
            Nombre
          </label>
          <input
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            type="text"
            placeholder="Nombre"
            className="w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
            required
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
            Apellido
          </label>
          <input
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            type="text"
            placeholder="Apellido"
            className="w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2 text-sm text-content-primary outline-none transition placeholder:text-content-muted focus:border-red-300 focus:ring-4 focus:ring-red-100"
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
            Correo
          </label>
          <input
            value={regEmail}
            onChange={(e) => onRegEmailChange(e.target.value)}
            type="email"
            placeholder="correo@ejemplo.com"
            disabled={fromGoogle}
            className={`w-full rounded-lg border border-border-default bg-surface-primary px-3 py-2 text-sm text-content-primary outline-none transition ${
              fromGoogle ? "cursor-not-allowed opacity-80" : ""
            }`}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-content-secondary">
            Fecha de nacimiento
          </label>
          <DatePicker
            value={birthdate}
            onChange={onBirthdateChange}
            placeholder="dd/mm/aaaa"
            required
            maxDate={new Date()}
          />
          {isUnderMinimumAge && (
            <p className="mt-2 text-xs leading-5 text-amber-700">
              GOKAI no permite el registro de usuarios menores de 13 años.
            </p>
          )}
        </div>
      </div>

      {requiresGuardianConsent && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-3 py-3">
          <Checkbox
            id="register-guardian-consent"
            checked={guardianConsent}
            onChange={onGuardianConsentChange}
            className="pt-0.5"
          />
          <p className="min-w-0 text-xs font-medium leading-5 text-amber-900">
            Confirmo que cuento con autorización de mi madre, padre o tutor
            legal para registrar y usar esta cuenta en GOKAI.
          </p>
        </div>
      )}

      <PasswordField
        label="Contraseña"
        value={regPassword}
        onChange={onRegPasswordChange}
        show={showPass}
        onToggle={onToggleShowPass}
        placeholder="Contraseña"
        autoComplete="new-password"
      />

      <PasswordField
        label="Confirmar contraseña"
        value={regPassword2}
        onChange={onRegPassword2Change}
        show={showPass2}
        onToggle={onToggleShowPass2}
        placeholder="Confirmar contraseña"
        autoComplete="new-password"
      />

      <div className="flex items-start gap-2 pt-1">
        <Checkbox
          id="register-terms"
          checked={acceptedTerms}
          onChange={() => onOpenLegalDocument()}
          className="pt-0.5"
        />

        <div className="min-w-0 space-y-2">
          <p
            id="register-terms-description"
            className="text-xs font-medium leading-5 text-content-secondary"
          >
            Debes leer y aceptar por separado los{" "}
            <button
              type="button"
              onClick={() => onOpenLegalDocument("terms")}
              className={[
                "rounded-sm font-semibold underline underline-offset-3 transition focus:outline-none focus:ring-2",
                legalAcceptanceState.terms
                  ? "text-emerald-700 decoration-emerald-300 hover:text-emerald-800 focus:ring-emerald-200"
                  : "text-accent decoration-accent/40 hover:text-accent-hover focus:ring-red-200",
              ].join(" ")}
              aria-haspopup="dialog"
              aria-controls="register-terms-panel"
            >
              Términos y Condiciones
            </button>{" "}
            y la{" "}
            <button
              type="button"
              onClick={() => onOpenLegalDocument("privacy")}
              className={[
                "rounded-sm font-semibold underline underline-offset-3 transition focus:outline-none focus:ring-2",
                legalAcceptanceState.privacy
                  ? "text-emerald-700 decoration-emerald-300 hover:text-emerald-800 focus:ring-emerald-200"
                  : "text-accent decoration-accent/40 hover:text-accent-hover focus:ring-red-200",
              ].join(" ")}
              aria-haspopup="dialog"
              aria-controls="privacy-policy-panel"
            >
              Política de Privacidad
            </button>
            . La casilla solo se completará cuando aceptes ambos documentos
            dentro del modal.
          </p>
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creando cuenta..." : "Continuar"}
      </motion.button>
    </motion.form>
  );
}
