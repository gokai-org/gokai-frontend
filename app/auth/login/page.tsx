"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProgressDots from "../../../components/auth/ProgressDots";
import ErrorToast from "../../../components/feedback/ErrorToast";
import AnimatedGraphBackground from "../../../components/graph/AnimatedGraphBackground";

type LoginResponse = {
  token: string;
  user?: {
    id: string;
    name?: string;
    email: string;
    role?: string;
  };
};

const HERO_MESSAGES = [
  { jp: "あなたの成長は、あなただけのもの", es: "Tu progreso es único, como tú." },
  { jp: "継続は流暢さを生む", es: "La constancia crea fluidez." },
  { jp: "日本語を日常の一部に", es: "Haz del japonés parte de tu día." },
] as const;

type Mode = "login" | "register";

export default function LoginPage() {
  const router = useRouter();

  // Modo del card
  const [mode, setMode] = useState<Mode>("login");

  // login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPassword2, setRegPassword2] = useState("");

  const [remember, setRemember] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showPass2, setShowPass2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hero rotativo
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroFading, setHeroFading] = useState(false);

  // Animación card switch
  const [switchDir, setSwitchDir] = useState<"left" | "right">("left");
  const [switching, setSwitching] = useState(false);
  const switchTimeout = useRef<number | null>(null);

  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "", []);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroFading(true);
      setTimeout(() => {
        setHeroIndex((prev) => (prev + 1) % HERO_MESSAGES.length);
        setHeroFading(false);
      }, 220);
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (switchTimeout.current) window.clearTimeout(switchTimeout.current);
    };
  }, []);

  useEffect(() => {
    function onPopState() {
      if (typeof window === "undefined") return;
      const path = window.location.pathname;
      if (path !== "/auth/login") {
        const target = path + (window.location.search || "") + (window.location.hash || "");
        router.replace(target);
      }
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  function startSwitch(next: Mode) {
    if (next === mode || switching) return;

    // Dirección del slide
    setSwitchDir(next === "register" ? "left" : "right");
    setSwitching(true);

    // Limpiar error al cambiar
    setErrorMsg(null);

    // inicia salida
    switchTimeout.current = window.setTimeout(() => {
      setMode(next);

      // Limpiar campos al cambiar de modo
      setPassword("");
      setShowPass(false);
      setShowPass2(false);

      // Registrar
      setRegPassword("");
      setRegPassword2("");

      // Vuelve a entrar
      switchTimeout.current = window.setTimeout(() => {
        setSwitching(false);
      }, 260);
    }, 220);
  }

  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Redirección temporal directamente al Home
    router.push("/dashboard/graph");
    return;

    // -- Lógica original (API) debajo --
    setErrorMsg(null);
    setLoading(true);

    try {
      if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL en .env.local");

      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo iniciar sesión. Verifica tus credenciales.");
      }

      const data = (await res.json()) as LoginResponse;

      if (!data?.token) throw new Error("Respuesta inválida del servidor (token faltante).");

      if (remember) localStorage.setItem("gokai_token", data.token);
      else sessionStorage.setItem("gokai_token", data.token);

      router.push("/dashboard/graph");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    // Validaciones básicas front
    if (regPassword.length < 8) {
      setErrorMsg("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (regPassword !== regPassword2) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      if (!apiBase) throw new Error("NEXT_PUBLIC_API_BASE_URL en .env.local");

      // Endpoint backend Go
      const res = await fetch(`${apiBase}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: regEmail,
          password: regPassword,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "No se pudo registrar. Intenta de nuevo.");
      }

      //Token backend
      startSwitch("login");
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    setErrorMsg("Google Login no configurado.");
  }

  const hero = HERO_MESSAGES[heroIndex];

  // Clases animación
  const slideOut =
    switchDir === "left"
      ? "translate-x-[-18px] opacity-0"
      : "translate-x-[18px] opacity-0";

  const slideIn =
    switchDir === "left"
      ? "translate-x-[18px] opacity-0"
      : "translate-x-[-18px] opacity-0";

  const contentClass = [
    "transition-all duration-300 ease-out",
    switching ? slideOut : "translate-x-0 opacity-100",
  ].join(" ");

  return (
    <main
    className="relative min-h-screen overflow-hidden bg-neutral-50">
    <AnimatedGraphBackground />
    <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/10 to-white/30" />

      {errorMsg && <ErrorToast message={errorMsg} onClose={() => setErrorMsg(null)} />}

      {/* Texto fijo en esquina inferior izquierda */}
        <section className="hidden xl:block absolute left-6 bottom-10 z-20 pointer-events-none">
        <div className="max-w-xl">
          <p
            className={[
              "text-2xl font-medium tracking-wide text-neutral-900 transition-opacity duration-300",
              heroFading ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            {hero.jp}
          </p>

          <h1
            className={[
              "mt-2 text-4xl font-semibold leading-tight tracking-tight text-neutral-900 transition-opacity duration-300",
              heroFading ? "opacity-0" : "opacity-100",
            ].join(" ")}
          >
            {hero.es}
          </h1>

          <div className="mt-6">
            <ProgressDots activeIndex={heroIndex} />
          </div>
        </div>
      </section>

      <div className="relative z-10 flex min-h-screen w-full items-center px-6 py-10 lg:pl-10 lg:pr-35">
        <div className="w-full">

          {/* Card */}
          <section className="flex w-full justify-center lg:justify-end lg:self-center lg:mr-15 xl:mr-14">
            <div className="w-full max-w-sm md:max-w-md lg:max-w-lg rounded-2xl bg-white/95 p-7 md:p-8 lg:p-9 shadow-xl ring-1 ring-black/5 backdrop-blur overflow-hidden">
              <div className={contentClass}>
                {/* Header */}
                <div className="flex flex-col items-center text-center">
                  <div className="flex items-center justify-center">
                    <Image
                      src="/logos/gokai-logo.svg"
                      alt="Gokai"
                      width={72}
                      height={72}
                      priority
                    />
                  </div>

                  {mode === "login" ? (
                    <>
                      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
                        Iniciar sesión
                      </h2>
                      <p className="mt-1 text-sm font-medium text-neutral-500">
                        Bienvenido de nuevo, estudiante de japonés.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-neutral-900">
                        Registrarse
                      </h2>
                      <p className="mt-1 text-sm font-medium text-neutral-500">
                        Crea tu cuenta y descubre un aprendizaje hecho a tu medida.
                      </p>
                    </>
                  )}
                </div>

                {/* Login */}
                {mode === "login" && (
                  <form className="mt-7 space-y-5" onSubmit={handleLoginSubmit}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Correo
                      </label>
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPass ? "text" : "password"}
                          placeholder="Contraseña"
                          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
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
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M10.58 10.58a2 2 0 0 0 2.83 2.83" />
                              <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c6.5 0 10 8 10 8a18.4 18.4 0 0 1-2.7 4.1" />
                              <path d="M6.61 6.61A18.4 18.4 0 0 0 2 12s3.5 8 10 8a10.94 10.94 0 0 0 5.39-1.39" />
                              <line x1="2" y1="2" x2="22" y2="22" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300 text-red-700 focus:ring-red-500"
                      />
                      <label htmlFor="remember" className="text-sm font-medium text-neutral-700">
                        Mantener sesión
                      </label>
                    </div>

                    <button
                      type="submit"
                      onClick={() => router.push("/dashboard/graph")}
                      disabled={loading}
                      className="w-full rounded-lg bg-[#993331] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Iniciando..." : "Iniciar sesión"}
                    </button>

                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-neutral-200" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                        or
                      </span>
                      <div className="h-px flex-1 bg-neutral-200" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-800 shadow-sm transition hover:bg-neutral-50 focus:outline-none focus:ring-4 focus:ring-neutral-200"
                    >
                      Iniciar sesión con Google
                      <span aria-hidden="true">
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path
                            fill="#FFC107"
                            d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.1 29.4 2 24 2 12.9 2 4 10.9 4 22s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.1-.4-3.5z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 4.1 29.4 2 24 2 16.3 2 9.7 6.3 6.3 14.7z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24 42c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 36 24 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.5 39.6 16.2 42 24 42z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.6 5.7-6.9 6.8l.1.1 6.3 5.2C38 37 44 32 44 22c0-1.3-.1-2.1-.4-3.5z"
                          />
                        </svg>
                      </span>
                    </button>

                    <p className="pt-1 text-center text-sm font-medium text-neutral-600">
                      ¿Necesitas una cuenta?{" "}
                      <button
                        type="button"
                        onClick={() => startSwitch("register")}
                        className="font-semibold text-[#993331] hover:underline"
                      >
                        Crear una cuenta
                      </button>
                    </p>
                  </form>
                )}

                {/* Register */}
                {mode === "register" && (
                  <form className="mt-7 space-y-5" onSubmit={handleRegisterSubmit}>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Nombre
                      </label>
                      <input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        type="text"
                        placeholder="Nombre"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        required
                        autoComplete="given-name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Apellido
                      </label>
                      <input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        type="text"
                        placeholder="Apellido"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        required
                        autoComplete="family-name"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Correo
                      </label>
                      <input
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        required
                        autoComplete="email"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Contraseña
                      </label>
                      <div className="relative">
                        <input
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          type={showPass ? "text" : "password"}
                          placeholder="Contraseña"
                          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
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
                      <label className="mb-2 block text-sm font-semibold text-neutral-700">
                        Repetir contraseña
                      </label>
                      <div className="relative">
                        <input
                          value={regPassword2}
                          onChange={(e) => setRegPassword2(e.target.value)}
                          type={showPass2 ? "text" : "password"}
                          placeholder="Repetir contraseña"
                          className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-300 focus:border-red-300 focus:ring-4 focus:ring-red-100"
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

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg bg-[#993331] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#882d2d] focus:outline-none focus:ring-4 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Creando..." : "Iniciar aprendizaje"}
                    </button>

                    <p className="pt-1 text-center text-sm font-medium text-neutral-600">
                      ¿Ya eres parte de GOKAI?{" "}
                      <button
                        type="button"
                        onClick={() => startSwitch("login")}
                        className="font-semibold text-[#993331] hover:underline"
                      >
                        Inicia sesión.
                      </button>
                    </p>
                  </form>
                )}

                {/* Texto en móvil */}
                  <div className="mt-8 block xl:hidden">
                  <p
                    className={[
                      "text-lg font-medium tracking-wide text-neutral-900 transition-opacity duration-300",
                      heroFading ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  >
                    {hero.jp}
                  </p>
                  <p
                    className={[
                      "mt-1 text-2xl font-semibold tracking-tight text-neutral-900 transition-opacity duration-300",
                      heroFading ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  >
                    {hero.es}
                  </p>
                  <div className="mt-4">
                    <ProgressDots activeIndex={heroIndex} />
                  </div>
                </div>
              </div>

              <style jsx>{`
              `}</style>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
