"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PremiumStepIndicator } from "@/features/auth/components/PremiumStepIndicator";

type Mode = "login" | "register" | "forgot-password";
type ForgotStep = "email" | "code" | "password";
type RegisterStep = "form" | "verify-email";
type MembershipIntent = "free" | "premium";

type Props = {
  mode: Mode;
  forgotStep: ForgotStep;
  registerStep: RegisterStep;
  intent: MembershipIntent | null;
  regEmail: string;
};

export function AuthHeader({
  mode,
  forgotStep,
  registerStep,
  intent,
  regEmail,
}: Props) {
  return (
    <div className="flex flex-col items-center text-center">
      <a href="/" className="inline-block">
        <motion.div
          className="flex items-center justify-center"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="/logos/gokai-logo.svg"
            alt="Gokai"
            width={60}
            height={60}
            priority
          />
        </motion.div>
      </a>

      {mode === "login" ? (
        <>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-content-primary">
            Iniciar sesión
          </h2>
          <p className="mt-1 text-sm font-medium text-content-tertiary">
            Bienvenido de nuevo, estudiante de japonés.
          </p>
        </>
      ) : mode === "register" ? (
        <>
          {intent === "premium" && registerStep === "form" && (
            <PremiumStepIndicator />
          )}

          <h2
            className={[
              "text-2xl font-semibold tracking-tight text-content-primary",
              intent === "premium" && registerStep === "form" ? "mt-5" : "mt-3",
            ].join(" ")}
          >
            {registerStep === "verify-email"
              ? "Verifica tu correo"
              : intent === "premium"
                ? "Desbloquea GOKAI+"
                : "Registrarse"}
          </h2>

          <p className="mt-1 text-sm font-medium text-content-tertiary">
            {registerStep === "verify-email"
              ? `Ingresa el código que enviamos a ${regEmail || "tu correo"}.`
              : intent === "premium"
                ? "Crea tu cuenta para continuar con GOKAI+."
                : "Crea tu cuenta y descubre un aprendizaje hecho a tu medida."}
          </p>

          {intent === "premium" && registerStep === "form" && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-content-muted">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              No se realizará ningún cobro todavía
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-content-primary">
            Recuperar contraseña
          </h2>
          <p className="mt-1 text-sm font-medium text-content-tertiary">
            {forgotStep === "email" && "Ingresa tu correo para recibir el código."}
            {forgotStep === "code" && "Ingresa el código de verificación."}
            {forgotStep === "password" && "Crea tu nueva contraseña."}
          </p>
        </>
      )}
    </div>
  );
}