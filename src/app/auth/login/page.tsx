"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ProgressDots from "@/features/auth/components/ProgressDots";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { useToast } from "@/shared/ui/ToastProvider";
import { LoginHistoryHandler } from "@/features/auth/components/LoginHistoryHandler";
import { DatePicker } from "@/shared/ui/DatePicker";
import { Checkbox } from "@/shared/ui/Checkbox";

const HERO_MESSAGES = [
  { jp: "あなたの成長は、あなただけのもの", es: "Tu progreso es único, como tú." },
  { jp: "継続は流暢さを生む", es: "La constancia crea fluidez." },
  { jp: "日本語を日常の一部に", es: "Haz del japonés parte de tu día." },
] as const;

type Mode = "login" | "register" | "forgot-password";
type ForgotStep = "email" | "code" | "password";
type RegisterStep = "form" | "verify-email";
type MembershipIntent = "free" | "premium";

function parseIntent(raw: string | null): MembershipIntent | null {
  if (raw === "free" || raw === "premium") return raw;
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const CODE_LEN = 6;

  // Modo del card
  const [mode, setMode] = useState<Mode>("login");

  // Membership intent
  const [intent, setIntent] = useState<MembershipIntent | null>(null);

  // Forgot password flow
  const [forgotStep, setForgotStep] = useState<ForgotStep>("email");
  const [forgotEmail, setForgotEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState(Array(CODE_LEN).fill(""));
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Register verify email flow (UI)
  const [registerStep, setRegisterStep] = useState<RegisterStep>("form");
  const [regVerificationCode, setRegVerificationCode] = useState(Array(CODE_LEN).fill(""));  
  const regCodeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
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

  // Hero rotativo
  const [heroIndex, setHeroIndex] = useState(0);

  // Animación card switch
  const [switchDir, setSwitchDir] = useState<"left" | "right">("left");
  const [switching, setSwitching] = useState(false);
  const switchTimeout = useRef<number | null>(null);

  // Bloquea el email si viene de Google
  const fromGoogle =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("google") === "1";

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const google = sp.get("google");
    const urlMode = sp.get("mode");
    const urlIntent = sp.get("intent");

    // If mode=register is requested with a valid intent, go directly to register
    if (urlMode === "register") {
      const parsed = parseIntent(urlIntent);
      if (parsed) {
        setIntent(parsed);
        setMode("register");
      } else {
        // No valid intent — redirect to membership picker
        window.location.replace("/auth/membership");
        return;
      }
    }

    if (google === "1") {
      const e = sp.get("email") || "";
      const fn = sp.get("firstName") || "";
      const ln = sp.get("lastName") || "";

      setMode("register");
      if (!intent) setIntent("free"); // default for google users
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

  function startSwitch(next: Mode) {
    if (next === mode || switching) return;

    if (next === "register") setSwitchDir("left");
    else if (next === "forgot-password") setSwitchDir("left");
    else setSwitchDir("right");

    setSwitching(true);

    switchTimeout.current = window.setTimeout(() => {
      setMode(next);

      // Limpiar campos al cambiar de modo
      setPassword("");
      setShowPass(false);
      setShowPass2(false);

      // Registrar
      setRegPassword("");
      setRegPassword2("");

      // Reset register verify UI
      setRegisterStep("form");
      setRegVerificationCode(Array(CODE_LEN).fill(""));

      // Reset forgot password
      setForgotStep("email");
      setForgotEmail("");
      setVerificationCode(Array(CODE_LEN).fill(""));
      setNewPassword("");
      setConfirmNewPassword("");

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

      toast.success("Sesión iniciada correctamente");

      const searchParams = new URLSearchParams(window.location.search);
      const from = searchParams.get("from") || "/dashboard/graph";
      window.location.replace(from);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error?.message ?? "Error inesperado.");
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

        toast.success("¡Cuenta creada exitosamente!");
        window.location.replace(getPostRegisterDestination());
        return;
      }

      // 1) Crear usuario primero (el backend necesita que exista para enviar código)
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

      // 2) Enviar código de verificación (ahora el usuario ya existe)
      const codeRes = await fetch("/api/auth/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: regEmail, type: "email-verification" }),
      });
      const codeData = await codeRes.json().catch(() => null);
      if (!codeRes.ok) {
        toast.error(codeData?.error || "No se pudo enviar el código de verificación.");
        return;
      }

      toast.success(`Te enviamos un código a ${regEmail}`);
      setRegisterStep("verify-email");
      setRegVerificationCode(Array(CODE_LEN).fill(""));
      requestAnimationFrame(() => regCodeInputRefs.current[0]?.focus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error?.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = "/api/auth/google";
  }

  async function handleGoogleSuccess(_credentialResponse: { credential?: string }) {
    try {
      setLoading(true);
      toast.success("Sesión iniciada correctamente");
      router.push("/dashboard/graph");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error?.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verification/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, type: "password-recovery" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo enviar el código.");
      toast.success(`Código enviado a ${forgotEmail}`);
      setForgotStep("code");
      requestAnimationFrame(() => codeInputRefs.current[0]?.focus());
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerificationCode(e: React.FormEvent) {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== CODE_LEN) {
        toast.error("Ingresa el código completo");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verification/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code, type: "password-recovery" }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Código inválido o expirado.");
      toast.success("Código verificado");
      setForgotStep("password");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const code = verificationCode.join("");
      const res = await fetch("/api/auth/verification/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, code, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "No se pudo restablecer la contraseña.");
      toast.success("¡Contraseña actualizada exitosamente!");
      startSwitch("login");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Error desconocido");
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Forgot code input
  function handleCodeInput(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (value && index < CODE_LEN - 1) codeInputRefs.current[index + 1]?.focus();
  }
  function handleCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      codeInputRefs.current[index - 1]?.focus();
    }
  }

  // Register verify code input (UI)
  function handleRegCodeInput(index: number, value: string) {
    if (!/^[0-9]?$/.test(value)) return;

    const newCode = [...regVerificationCode];
    newCode[index] = value;
    setRegVerificationCode(newCode);

    if (value && index < CODE_LEN - 1) regCodeInputRefs.current[index + 1]?.focus();
  }
  function handleRegCodeKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
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

    // 1) Verificar código de correo
    const verifyRes = await fetch("/api/auth/verification/verify-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, code, type: "email-verification" }),
    });

    const verifyData = await verifyRes.json().catch(() => null);
    if (!verifyRes.ok) throw new Error(verifyData?.error || "Código inválido o expirado.");

    toast.success("Correo verificado");

    // 2) Auto-login para que el backend setee la cookie (gokai_token)
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: regEmail, password: regPassword, remember: true }),
    });

    const loginData = await loginRes.json().catch(() => null);
    if (!loginRes.ok) {
      toast.error(loginData?.error || "No se pudo iniciar sesión automáticamente.");
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
    if (intent === "premium") return "/checkout";
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
      if (!res.ok) throw new Error(data?.error || "No se pudo reenviar el código.");
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
    switchDir === "left" ? "translate-x-[-18px] opacity-0" : "translate-x-[18px] opacity-0";

  const contentClass = ["transition-all duration-300 ease-out", switching ? slideOut : "translate-x-0 opacity-100"].join(
    " "
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50">
      <LoginHistoryHandler />
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-white/20 via-white/10 to-white/30" />

      {/* Texto fijo en esquina inferior izquierda */}
      <motion.section
        className="hidden xl:block absolute left-6 bottom-10 z-20 pointer-events-none"
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-2xl font-medium tracking-wide text-neutral-900">{hero.jp}</p>
              <h1 className="mt-2 text-4xl font-semibold leading-tight tracking-tight text-neutral-900">{hero.es}</h1>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6">
            <ProgressDots activeIndex={heroIndex} />
          </div>
        </div>
      </motion.section>

      <div className="relative z-10 flex min-h-screen w-full items-center px-6 py-10 lg:pl-10 lg:pr-35">
        <div className="w-full">
          {/* Card */}
          <section className="flex w-full justify-center lg:justify-end lg:self-center lg:mr-15 xl:mr-14">
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", layout: { duration: 0.4, ease: "easeInOut" } }}
              className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-white/95 p-6 md:p-7 shadow-xl ring-1 ring-black/5 backdrop-blur overflow-hidden"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: switchDir === "left" ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: switchDir === "left" ? -30 : 30 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {/* Header */}
                  <div className="flex flex-col items-center text-center">
                    <a href="/" className="inline-block">
                      <motion.div
                        className="flex items-center justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Image src="/logos/gokai-logo.svg" alt="Gokai" width={60} height={60} priority />
                      </motion.div>
                    </a>

                    {mode === "login" ? (
                      <>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">Iniciar sesión</h2>
                        <p className="mt-1 text-sm font-medium text-neutral-500">Bienvenido de nuevo, estudiante de japonés.</p>
                      </>
                    ) : mode === "register" ? (
                      <>
                        {intent === "premium" && registerStep === "form" && (
                          <div className="mt-4 w-full max-w-xs mx-auto">
                            {/* Step label */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-[#993331]">Paso 1 de 3</span>
                              <span className="text-xs font-medium text-neutral-400">Crear cuenta</span>
                            </div>
                            {/* Progress bar */}
                            <div className="h-1.5 w-full rounded-full bg-neutral-100 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-[#993331]"
                                initial={{ width: 0 }}
                                animate={{ width: "33%" }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                              />
                            </div>
                            {/* Step dots */}
                            <div className="mt-1.5 flex items-center justify-between px-[2px]">
                              {["Cuenta", "Pago", "Listo"].map((label, i) => (
                                <div key={label} className="flex flex-col items-center gap-1">
                                  <div
                                    className={[
                                      "h-2 w-2 rounded-full transition-colors",
                                      i === 0 ? "bg-[#993331]" : "bg-neutral-200",
                                    ].join(" ")}
                                  />
                                  <span
                                    className={[
                                      "text-[10px] font-medium",
                                      i === 0 ? "text-[#993331]" : "text-neutral-300",
                                    ].join(" ")}
                                  >
                                    {label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <h2 className={[
                          "text-2xl font-semibold tracking-tight text-neutral-900",
                          intent === "premium" && registerStep === "form" ? "mt-5" : "mt-3",
                        ].join(" ")}>
                          {registerStep === "verify-email"
                            ? "Verifica tu correo"
                            : intent === "premium"
                            ? "Desbloquea GOKAI+"
                            : "Registrarse"}
                        </h2>
                        <p className="mt-1 text-sm font-medium text-neutral-500">
                          {registerStep === "verify-email"
                            ? `Ingresa el código que enviamos a ${regEmail || "tu correo"}.`
                            : intent === "premium"
                            ? "Crea tu cuenta para continuar con GOKAI+."
                            : "Crea tu cuenta y descubre un aprendizaje hecho a tu medida."}
                        </p>
                        {intent === "premium" && registerStep === "form" && (
                          <p className="mt-2 flex items-center justify-center gap-1.5 text-xs text-neutral-400">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            No se realizará ningún cobro todavía
                          </p>
                        )}
                      </>
                    ) : (
                      <>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">Recuperar contraseña</h2>
                        <p className="mt-1 text-sm font-medium text-neutral-500">
                          {forgotStep === "email" && "Ingresa tu correo para recibir el código."}
                          {forgotStep === "code" && "Ingresa el código de verificación."}
                          {forgotStep === "password" && "Crea tu nueva contraseña."}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Login */}
                  {mode === "login" && (
                    <motion.form
                      className="mt-5 space-y-3"
                      onSubmit={handleLoginSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Correo</label>
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          type="email"
                          placeholder="correo@ejemplo.com"
                          className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                          required
                          autoComplete="email"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Contraseña</label>
                        <div className="relative">
                          <input
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type={showPass ? "text" : "password"}
                            placeholder="Contraseña"
                            className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPass((s) => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
                            aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                            title={showPass ? "Ocultar" : "Mostrar"}
                          >
                            {showPass ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                                <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                                <line x1="2" y1="2" x2="22" y2="22" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      <Checkbox
                        id="remember"
                        checked={remember}
                        onChange={setRemember}
                        label="Mantener sesión"
                      />

                      <div className="flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => startSwitch("forgot-password")}
                          className="text-sm font-semibold text-[#993331] hover:underline transition"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>

                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.02 }}
                        whileTap={{ scale: loading ? 1 : 0.98 }}
                        className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loading ? "Iniciando..." : "Iniciar sesión"}
                      </motion.button>

                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">or</span>
                        <div className="h-px flex-1 bg-neutral-200" />
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-700 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.3 0 6.3 1.2 8.6 3.2l6.4-6.4C34.8 2.5 29.7 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.7 6C12.3 13.6 17.7 9.5 24 9.5z" />
                          <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.4 6.9l7 5.4c4.1-3.8 7.1-9.4 7.1-16.8z" />
                          <path fill="#FBBC05" d="M10.3 28.9c-1-2.9-1-6 0-8.9l-7.7-6C.9 17.4 0 20.6 0 24s.9 6.6 2.6 10l7.7-6z" />
                          <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7-5.4c-2 1.4-4.6 2.2-8.8 2.2-6.3 0-11.7-4.1-13.7-9.8l-7.7 6C6.6 42.6 14.6 48 24 48z" />
                        </svg>
                        <span className="transition-colors duration-200 group-hover:text-neutral-900">Continuar con Google</span>
                      </button>

                      <p className="pt-1 text-center text-sm font-medium text-neutral-600">
                        ¿Necesitas una cuenta?{" "}
                        <button
                          type="button"
                          onClick={() => router.replace("/auth/membership")}
                          className="font-semibold text-[#993331] hover:underline"
                        >
                          Crear una cuenta
                        </button>
                      </p>
                    </motion.form>
                  )}

                  {/* Register */}
                  {mode === "register" && (
                    <motion.div
                      className="mt-5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                    >
                      <AnimatePresence mode="wait">
                        {/* Step 1: Register form */}
                        {registerStep === "form" && (
                          <motion.form
                            key="register-form"
                            className="space-y-2.5"
                            onSubmit={handleRegisterSubmit}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* Name row */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Nombre</label>
                                <input
                                  value={firstName}
                                  onChange={(e) => setFirstName(e.target.value)}
                                  type="text"
                                  placeholder="Nombre"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="given-name"
                                />
                              </div>
                              <div>
                                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Apellido</label>
                                <input
                                  value={lastName}
                                  onChange={(e) => setLastName(e.target.value)}
                                  type="text"
                                  placeholder="Apellido"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="family-name"
                                />
                              </div>
                            </div>

                            {/* Email & birthdate row */}
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Correo</label>
                                <input
                                  value={regEmail}
                                  onChange={(e) => setRegEmail(e.target.value)}
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
                                <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Fecha de nacimiento</label>
                                <DatePicker
                                  value={birthdate}
                                  onChange={setBirthdate}
                                  placeholder="dd/mm/aaaa"
                                  required
                                  maxDate={new Date()}
                                />
                              </div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Contraseña</label>
                              <div className="relative">
                                <input
                                  value={regPassword}
                                  onChange={(e) => setRegPassword(e.target.value)}
                                  type={showPass ? "text" : "password"}
                                  placeholder="Contraseña"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPass((s) => !s)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
                                  aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                                  title={showPass ? "Ocultar" : "Mostrar"}
                                >
                                  {showPass ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                                      <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="mb-1.5 block text-sm font-semibold text-neutral-700">Repetir contraseña</label>
                              <div className="relative">
                                <input
                                  value={regPassword2}
                                  onChange={(e) => setRegPassword2(e.target.value)}
                                  type={showPass2 ? "text" : "password"}
                                  placeholder="Repetir contraseña"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPass2((s) => !s)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
                                  aria-label={showPass2 ? "Ocultar contraseña" : "Mostrar contraseña"}
                                  title={showPass2 ? "Ocultar" : "Mostrar"}
                                >
                                  {showPass2 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                                      <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <motion.button
                              type="submit"
                              disabled={loading}
                              whileHover={{ scale: loading ? 1 : 1.02 }}
                              whileTap={{ scale: loading ? 1 : 0.98 }}
                              className="mt-1.5 w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {loading
                                ? "Creando..."
                                : intent === "premium"
                                ? "Continuar con GOKAI+"
                                : "Iniciar aprendizaje"}
                            </motion.button>

                            <p className="text-center text-xs font-medium text-neutral-600">
                              ¿Ya eres parte de GOKAI?{" "}
                              <button type="button" onClick={() => startSwitch("login")} className="font-semibold text-[#993331] hover:underline">
                                Inicia sesión.
                              </button>
                            </p>
                          </motion.form>
                        )}

                        {/* Step 2: Verify email (SAME UI AS FORGOT CODE) */}
                        {registerStep === "verify-email" && (
                          <motion.form
                            key="register-verify"
                            onSubmit={handleRegisterVerifyCode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            <div>
                              <label className="mb-4 block text-center text-sm font-semibold text-neutral-700">
                                Código de verificación
                              </label>

                              <div className="flex justify-center gap-2">
                                {regVerificationCode.map((digit, index) => (
                                  <motion.input
                                    key={index}
                                    ref={(el) => {
                                      regCodeInputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleRegCodeInput(index, e.target.value)}
                                    onKeyDown={(e) => handleRegCodeKeyDown(index, e)}
                                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.08, duration: 0.28 }}
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  />
                                ))}
                              </div>

                              <p className="mt-4 text-center text-xs font-medium text-neutral-500">
                                Enviado a <span className="font-semibold text-neutral-800">{regEmail || "tu correo"}</span>
                              </p>
                            </div>

                            <div className="text-center">
                              <button
                                type="button"
                                onClick={handleResendRegisterCode}
                                className="text-sm font-medium text-neutral-600 hover:text-[#993331] transition"
                              >
                                ¿No recibiste el código? <span className="font-semibold">Reenviar</span>
                              </button>
                            </div>

                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200"
                            >
                              Verificar correo
                            </motion.button>

                            <button
                              type="button"
                              onClick={() => {
                                setRegisterStep("form");
                                setRegVerificationCode(Array(CODE_LEN).fill(""));
                              }}
                              className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                            >
                              Volver
                            </button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Forgot Password */}
                  {mode === "forgot-password" && (
                    <motion.div className="mt-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }}>
                      <AnimatePresence mode="wait">
                        {forgotStep === "email" && (
                          <motion.form
                            key="email-step"
                            onSubmit={handleForgotPasswordEmail}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-neutral-700">Correo electrónico</label>
                              <input
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                type="email"
                                placeholder="correo@ejemplo.com"
                                className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                required
                                autoComplete="email"
                              />
                            </div>

                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200"
                            >
                              Enviar código
                            </motion.button>

                            <button
                              type="button"
                              onClick={() => startSwitch("login")}
                              className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                            >
                              Volver a inicio de sesión
                            </button>
                          </motion.form>
                        )}

                        {forgotStep === "code" && (
                          <motion.form
                            key="code-step"
                            onSubmit={handleVerificationCode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-6"
                          >
                            <div>
                              <label className="mb-4 block text-center text-sm font-semibold text-neutral-700">
                                Código de verificación
                              </label>
                              <div className="flex justify-center gap-2">
                                {verificationCode.map((digit, index) => (
                                  <motion.input
                                    key={index}
                                    ref={(el) => {
                                      codeInputRefs.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleCodeInput(index, e.target.value)}
                                    onKeyDown={(e) => handleCodeKeyDown(index, e)}
                                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    transition={{ delay: index * 0.1, duration: 0.3 }}
                                    className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border-2 border-neutral-200 bg-white text-neutral-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  />
                                ))}
                              </div>
                            </div>

                            <div className="text-center">
                              <button type="button" className="text-sm font-medium text-neutral-600 hover:text-[#993331] transition">
                                ¿No recibiste el código? <span className="font-semibold">Reenviar</span>
                              </button>
                            </div>

                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200"
                            >
                              Verificar código
                            </motion.button>

                            <button
                              type="button"
                              onClick={() => setForgotStep("email")}
                              className="w-full text-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition"
                            >
                              Volver
                            </button>
                          </motion.form>
                        )}

                        {forgotStep === "password" && (
                          <motion.form
                            key="password-step"
                            onSubmit={handleResetPassword}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <div>
                              <label className="mb-2 block text-sm font-semibold text-neutral-700">Nueva contraseña</label>
                              <div className="relative">
                                <input
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  type={showPass ? "text" : "password"}
                                  placeholder="Nueva contraseña"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPass((s) => !s)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
                                >
                                  {showPass ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                                      <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-semibold text-neutral-700">Confirmar contraseña</label>
                              <div className="relative">
                                <input
                                  value={confirmNewPassword}
                                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                                  type={showPass2 ? "text" : "password"}
                                  placeholder="Confirmar contraseña"
                                  className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                                  required
                                  autoComplete="new-password"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPass2((s) => !s)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-neutral-500 transition hover:bg-neutral-100"
                                >
                                  {showPass2 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                      <circle cx="12" cy="12" r="3" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                                      <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                                      <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                                      <line x1="2" y1="2" x2="22" y2="22" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            <motion.button
                              type="submit"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full rounded-lg bg-[#993331] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200"
                            >
                              Cambiar contraseña
                            </motion.button>
                          </motion.form>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Texto en móvil */}
                  <div className="mt-5 block xl:hidden">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={heroIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                      >
                        <p className="text-lg font-medium tracking-wide text-neutral-900">{hero.jp}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight text-neutral-900">{hero.es}</p>
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-4">
                      <ProgressDots activeIndex={heroIndex} />
                    </div>
                  </div>

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
