"use client";

import { motion } from "framer-motion";
import { DatePicker } from "@/shared/ui/DatePicker";
import { PasswordField } from "@/features/auth/components/PasswordField";

type Props = {
  firstName: string;
  lastName: string;
  regEmail: string;
  birthdate: string;
  regPassword: string;
  regPassword2: string;
  fromGoogle: boolean;
  showPass: boolean;
  showPass2: boolean;
  loading: boolean;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onRegEmailChange: (value: string) => void;
  onBirthdateChange: (value: string) => void;
  onRegPasswordChange: (value: string) => void;
  onRegPassword2Change: (value: string) => void;
  onToggleShowPass: () => void;
  onToggleShowPass2: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function RegisterForm({
  firstName,
  lastName,
  regEmail,
  birthdate,
  regPassword,
  regPassword2,
  fromGoogle,
  showPass,
  showPass2,
  loading,
  onFirstNameChange,
  onLastNameChange,
  onRegEmailChange,
  onBirthdateChange,
  onRegPasswordChange,
  onRegPassword2Change,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Nombre
          </label>
          <input
            value={firstName}
            onChange={(e) => onFirstNameChange(e.target.value)}
            type="text"
            placeholder="Nombre"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
            required
            autoComplete="given-name"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Apellido
          </label>
          <input
            value={lastName}
            onChange={(e) => onLastNameChange(e.target.value)}
            type="text"
            placeholder="Apellido"
            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
            required
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Correo
          </label>
          <input
            value={regEmail}
            onChange={(e) => onRegEmailChange(e.target.value)}
            type="email"
            placeholder="correo@ejemplo.com"
            disabled={fromGoogle}
            className={`w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition ${
              fromGoogle ? "opacity-80 cursor-not-allowed" : ""
            }`}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-neutral-700">
            Fecha de nacimiento
          </label>
          <DatePicker
            value={birthdate}
            onChange={onBirthdateChange}
            placeholder="dd/mm/aaaa"
            required
            maxDate={new Date()}
          />
        </div>
      </div>

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

      <motion.button
        type="submit"
        disabled={loading}
        whileHover={{ scale: loading ? 1 : 1.02 }}
        whileTap={{ scale: loading ? 1 : 0.98 }}
        className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creando cuenta..." : "Continuar"}
      </motion.button>
    </motion.form>
  );
}