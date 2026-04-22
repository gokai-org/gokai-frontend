"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { useToast } from "@/shared/ui/ToastProvider";
import { LoginHistoryHandler } from "@/features/auth/components/LoginHistoryHandler";
import { AuthHero } from "@/features/auth/components/AuthHero";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { LoginForm } from "@/features/auth/components/forms/LoginForm";
import { RegisterForm } from "@/features/auth/components/forms/RegisterForm";
import { RegisterVerifyForm } from "@/features/auth/components/forms/RegisterVerifyForm";
import { ForgotPasswordFlow } from "@/features/auth/components/forms/ForgotPasswordFlow";

const HERO_MESSAGES = [
  {
    jp: "あなたの成長は、あなただけのもの",
    es: "Tu progreso es único, como tú.",
  },
  { jp: "継続は流暢さを生む", es: "La constancia crea fluidez." },
  { jp: "日本語を日常の一部に", es: "Haz del japonés parte de tu día." },
] as const;

type Mode = "login" | "register" | "forgot-password";
type RegisterStep = "form" | "verify-email";
type MembershipIntent = "free" | "premium";
type UserProfile = "admin" | "user";

function parseIntent(raw: string | null): MembershipIntent | null {
  if (raw === "free" || raw === "premium") return raw;
  return null;
}

function normalizeProfile(value: unknown): UserProfile | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim().toLowerCase();
  if (normalized === "admin" || normalized === "user") return normalized;

  return null;
}

function getDestinationByProfile(
  profile: UserProfile | null,
  from: string | null,
) {
  if (profile === "admin") return "/admin/dashboard";
  return from || "/dashboard/graph";
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const CODE_LEN = 6;

  const [mode, setMode] = useState<Mode>("login");
  const [intent, setIntent] = useState<MembershipIntent | null>(null);

  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [regVerificationCode, setRegVerificationCode] = useState(
    Array(CODE_LEN).fill(""),
  );
  const regCodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);

  const [switchDir, setSwitchDir] = useState<"left" | "right">("left");
  const [switching, setSwitching] = useState(false);
  const switchTimeout = useRef<number | null>(null);
  const [fromGoogle, setFromGoogle] = useState(false);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const google = sp.get("google") === "1";
    const urlMode = sp.get("mode");
    const urlIntent = sp.get("intent");

    setFromGoogle(google);

    const parsedIntent = parseIntent(urlIntent);

    if (urlMode === "register") {
      if (parsedIntent) {
        setIntent(parsedIntent);
        setMode("register");
      } else {
        const membershipUrl = new URL(
          "/auth/membership",
          window.location.origin,
        );
        ["google", "email", "firstName", "lastName", "from"].forEach((key) => {
          const value = sp.get(key);
          if (value) membershipUrl.searchParams.set(key, value);
        });
        window.location.replace(membershipUrl.toString());
        return;
      }
    }

    if (google && urlMode !== "register") {
      const membershipUrl = new URL("/auth/membership", window.location.origin);
      ["google", "email", "firstName", "lastName", "from"].forEach((key) => {
        const value = sp.get(key);
        if (value) membershipUrl.searchParams.set(key, value);
      });
      window.location.replace(membershipUrl.toString());
      return;
    }

    if (google) {
      const e = sp.get("email") || "";
      const fn = sp.get("firstName") || "";
      const ln = sp.get("lastName") || "";

      if (parsedIntent) {
        setMode("register");
        setIntent(parsedIntent);
      }
      if (e) setRegEmail(e);
      if (fn) setFirstName(fn);
      if (ln) setLastName(ln);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % HERO_MESSAGES.length);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimeout.current) window.clearTimeout(switchTimeout.current);
    };
  }, []);

  function resetTransientState() {
    setPassword("");
    setShowPass(false);
    setShowPass2(false);

    setRegPassword("");
    setRegPassword2("");

    setRegisterStep("form");
    setRegVerificationCode(Array(CODE_LEN).fill(""));
  }

  function startSwitch(next: Mode) {
    if (next === mode || switching) return;

    if (next === "register") setSwitchDir("left");
    else if (next === "forgot-password") setSwitchDir("left");
    else setSwitchDir("right");

    setSwitching(true);

    switchTimeout.current = window.setTimeout(() => {
      setMode(next);
      resetTransientState();

      switchTimeout.current = window.setTimeout(() => {
        setSwitching(false);
      }, 260);
    }, 220);
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo iniciar sesión.");

      let profile = normalizeProfile(data?.user?.profile);

      if (!profile) {
        const meRes = await fetch("/api/auth/user", {
          method: "GET",
          credentials: "include",
        });

        if (meRes.ok) {
          const meData = await meRes.json().catch(() => null);
          profile = normalizeProfile(meData?.user?.profile);
        }
      }

      toast.success("Sesión iniciada correctamente");

      const searchParams = new URLSearchParams(window.location.search);
      const from = searchParams.get("from");
      window.location.replace(getDestinationByProfile(profile, from));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (regPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (regPassword !== regPassword2) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    if (!birthdate) {
      toast.error("Selecciona tu fecha de nacimiento.");
      return;
    }

    setLoading(true);

    try {
      if (fromGoogle) {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email: regEmail,
            password: regPassword,
            birthdate,
            isGoogleUser: true,
          }),
        });

        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "No se pudo registrar.");

        const loginRes = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: regEmail,
            password: regPassword,
            remember: true,
          }),
        });

        const loginData = await loginRes.json().catch(() => null);
        if (!loginRes.ok) {
          toast.error(
            loginData?.error || "No se pudo iniciar sesión automáticamente.",
          );
          const dest = getPostRegisterDestination();
          window.location.replace(`/auth/login?from=${encodeURIComponent(dest)}`);
          return;
        }

        toast.success("¡Cuenta creada exitosamente!");
        window.location.replace(getPostRegisterDestination());
        return;
      }

      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: regEmail,
          password: regPassword,
          birthdate,
        }),
      });

      const registerData = await registerRes.json().catch(() => null);
      if (!registerRes.ok) {
        toast.error(registerData?.error || "No se pudo crear la cuenta.");
        return;
      }

      const codeRes = await fetch("/api/auth/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, type: "email-verification" }),
      });

      const codeData = await codeRes.json().catch(() => null);
      if (!codeRes.ok) {
        toast.error(
          codeData?.error || "No se pudo enviar el código de verificación.",
        );
        return;
      }

      toast.success(`Te enviamos un código a ${regEmail}`);
      setRegisterStep("verify-email");
      setRegVerificationCode(Array(CODE_LEN).fill(""));
      requestAnimationFrame(() => regCodeInputRefs.current[0]?.focus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google";
  }

  function handleRegCodeInput(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...regVerificationCode];
    newCode[index] = value;
    setRegVerificationCode(newCode);

    if (value && index < CODE_LEN - 1) {
      regCodeInputRefs.current[index + 1]?.focus();
    }
  }

  function handleRegCodeKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !regVerificationCode[index] && index > 0) {
      regCodeInputRefs.current[index - 1]?.focus();
    }
  }

  async function handleRegisterVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    const code = regVerificationCode.join("");

    if (code.length !== CODE_LEN) {
      toast.error("Ingresa el código completo");
      return;
    }

    setLoading(true);

    try {
      if (!regEmail || !regPassword) {
        toast.error("Completa tus datos antes de continuar.");
        setRegisterStep("form");
        return;
      }

      const verifyRes = await fetch("/api/auth/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          code,
          type: "email-verification",
        }),
      });

      const verifyData = await verifyRes.json().catch(() => null);
      if (!verifyRes.ok) {
        throw new Error(verifyData?.error || "Código inválido o expirado.");
      }

      toast.success("Correo verificado");

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          remember: true,
        }),
      });

      const loginData = await loginRes.json().catch(() => null);
      if (!loginRes.ok) {
        toast.error(
          loginData?.error || "No se pudo iniciar sesión automáticamente.",
        );
        const dest = getPostRegisterDestination();
        window.location.replace(`/auth/login?from=${encodeURIComponent(dest)}`);
        return;
      }

      window.location.replace(getPostRegisterDestination());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getPostRegisterDestination(): string {
    if (intent === "premium") return "/checkout?flow=premium-onboarding";
    return "/onboarding/interests";
  }

  async function handleResendRegisterCode() {
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, type: "email-verification" }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok)
        throw new Error(data?.error || "No se pudo reenviar el código.");

      toast.success(`Código reenviado a ${regEmail}`);
      setRegVerificationCode(Array(CODE_LEN).fill(""));
      requestAnimationFrame(() => regCodeInputRefs.current[0]?.focus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const hero = HERO_MESSAGES[heroIndex];

  const slideOut =
    switchDir === "left"
      ? "translate-x-[-18px] opacity-0"
      : "translate-x-[18px] opacity-0";

  const contentClass = [
    "transition-all duration-300 ease-out",
    switching ? slideOut : "translate-x-0 opacity-100",
  ].join(" ");

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-surface-secondary">
      <LoginHistoryHandler />
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-surface-primary/20 via-surface-primary/10 to-surface-primary/30" />

      <AuthHero hero={hero} heroIndex={heroIndex} />

      <div className="relative z-10 flex min-h-dvh w-full items-center px-6 py-10 lg:pl-10 lg:pr-35 lg:pt-16 xl:pt-20">
        <div className="w-full">
          <section className="flex w-full justify-center lg:justify-end lg:self-center lg:mr-15 xl:mr-14">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                layout: { duration: 0.4, ease: "easeInOut" },
              }}
              className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-surface-primary/95 p-6 md:p-7 shadow-xl ring-1 ring-border-subtle backdrop-blur overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: switchDir === "left" ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: switchDir === "left" ? -30 : 30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <AuthHeader
                    mode={mode}
                    registerStep={registerStep}
                    intent={intent}
                    regEmail={regEmail}
                  />

                  {mode === "login" && (
                    <LoginForm
                      email={email}
                      password={password}
                      remember={remember}
                      showPass={showPass}
                      loading={loading}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onRememberChange={setRemember}
                      onToggleShowPass={() => setShowPass((s) => !s)}
                      onForgotPassword={() => startSwitch("forgot-password")}
                      onGoogleLogin={handleGoogleLogin}
                      onGoToMembership={() =>
                        router.replace("/auth/membership")
                      }
                      onSubmit={handleLoginSubmit}
                    />
                  )}

                  {mode === "register" && (
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <AnimatePresence mode="wait">
                        {registerStep === "form" && (
                          <RegisterForm
                            firstName={firstName}
                            lastName={lastName}
                            regEmail={regEmail}
                            birthdate={birthdate}
                            regPassword={regPassword}
                            regPassword2={regPassword2}
                            fromGoogle={fromGoogle}
                            showPass={showPass}
                            showPass2={showPass2}
                            loading={loading}
                            onFirstNameChange={setFirstName}
                            onLastNameChange={setLastName}
                            onRegEmailChange={setRegEmail}
                            onBirthdateChange={setBirthdate}
                            onRegPasswordChange={setRegPassword}
                            onRegPassword2Change={setRegPassword2}
                            onToggleShowPass={() => setShowPass((s) => !s)}
                            onToggleShowPass2={() => setShowPass2((s) => !s)}
                            onSubmit={handleRegisterSubmit}
                          />
                        )}

                        {registerStep === "verify-email" && (
                          <RegisterVerifyForm
                            regEmail={regEmail}
                            regVerificationCode={regVerificationCode}
                            regCodeInputRefs={regCodeInputRefs}
                            onRegCodeInput={handleRegCodeInput}
                            onRegCodeKeyDown={handleRegCodeKeyDown}
                            onSubmit={handleRegisterVerifyCode}
                            onResend={handleResendRegisterCode}
                            onBack={() => {
                              setRegisterStep("form");
                              setRegVerificationCode(Array(CODE_LEN).fill(""));
                            }}
                          />
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {mode === "forgot-password" && (
                    <ForgotPasswordFlow
                      onSuccess={() => startSwitch("login")}
                      onBack={() => startSwitch("login")}
                    />
                  )}

                  <div className={contentClass} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </section>
        </div>
      </div>
    </main>
  );
}
