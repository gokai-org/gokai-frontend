import { Mail, KeyRound, ShieldCheck } from "lucide-react";
import type { PasswordResetStep } from "@/features/auth/hooks/usePasswordResetFlow";

const META: Record<PasswordResetStep, {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  sub: string | null;
}> = {
  email: {
    icon: Mail,
    title: "Recuperar contraseña",
    sub: "Te enviaremos un código de 6 dígitos a tu correo.",
  },
  code: {
    icon: KeyRound,
    title: "Ingresa el código",
    sub: null,
  },
  password: {
    icon: ShieldCheck,
    title: "Nueva contraseña",
    sub: "Elige una contraseña segura de al menos 8 caracteres.",
  },
};

const STEPS: PasswordResetStep[] = ["email", "code", "password"];

interface Props {
  step: PasswordResetStep;
  email?: string;
}

export function PasswordResetStepHeader({ step, email }: Props) {
  const { icon: Icon, title, sub } = META[step];

  return (
    <div className="flex flex-col items-center gap-2 text-center mb-5">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-accent-subtle">
        <Icon className="w-5 h-5 text-accent" />
      </div>

      <p className="text-sm font-semibold text-content-primary">{title}</p>

      {sub && (
        <p className="text-xs text-content-tertiary leading-relaxed max-w-[240px]">{sub}</p>
      )}

      {email && step !== "email" && (
        <p className="text-xs text-content-tertiary leading-relaxed">
          {step === "code" ? "Revisá tu bandeja en " : "Para la cuenta "}
          <span className="font-semibold text-content-secondary">{email}</span>
        </p>
      )}

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mt-1">
        {STEPS.map((s, i) => {
          const pastStep = STEPS.indexOf(step);
          const isActive = s === step;
          const isDone = i < pastStep;
          return (
            <span
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isActive ? "w-6 bg-accent" : isDone ? "w-3 bg-accent/40" : "w-3 bg-border-default"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
