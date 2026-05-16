"use client";

import { Suspense, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { MembershipPicker } from "@/features/landing/components/MembershipPicker";

function MembershipContent() {
  const searchParams = useSearchParams();
  const safeReturnTo = useMemo(() => {
    const value = searchParams.get("returnTo");
    return value && value.startsWith("/") ? value : null;
  }, [searchParams]);
  const inAppCompare = safeReturnTo !== null;

  const forwardedGoogleParams = useMemo(() => {
    const params = new URLSearchParams();
    const allowed = ["google", "email", "firstName", "lastName", "from"];

    for (const key of allowed) {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    }

    return params.toString() ? params : null;
  }, [searchParams]);

  return (
    <main className="relative min-h-dvh overflow-x-hidden bg-surface-secondary">
      <AnimatedGraphBackground />
      <div className="absolute inset-0 bg-linear-to-b from-surface-primary/20 via-surface-primary/10 to-surface-primary/30" />

      <div className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-6 py-16">
        {inAppCompare ? (
          <div className="mb-8 flex w-full max-w-5xl justify-start">
            <Link
              href={safeReturnTo}
              className="inline-flex items-center gap-2 rounded-full border border-accent/16 bg-surface-primary/78 px-4 py-2 text-sm font-semibold text-accent shadow-sm backdrop-blur transition hover:border-accent/30 hover:bg-surface-primary"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2.2} />
              Regresar
            </Link>
          </div>
        ) : null}

        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link href={inAppCompare ? safeReturnTo : "/"} className="inline-block">
            <div className="relative h-[72px] w-[72px]">
              <Image
                src="/logos/gokai-logo.svg"
                alt="Gokai"
                width={72}
                height={72}
                priority
                className="dark:hidden"
              />
              <Image
                src="/logos/gokai-logo-dark.svg"
                alt=""
                width={72}
                height={72}
                priority
                className="hidden dark:block"
              />
            </div>
          </Link>

          <p className="mt-6 text-2xl md:text-4xl font-extrabold text-accent">
            {inAppCompare ? "Compara tu acceso" : "Elige tu plan"}
          </p>
          <h1 className="mt-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary">
            {inAppCompare
              ? "Desbloquea la experiencia premium"
              : "Comienza tu camino en japonés"}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-content-secondary">
            {inAppCompare
              ? "Estás comparando planes desde dentro de la plataforma. Si mejoras a GOKAI+, volverás directamente al punto donde intentabas entrar."
              : "Selecciona cómo quieres aprender. Siempre puedes mejorar tu plan después."}
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-12 w-full max-w-5xl">
          <MembershipPicker
            mode="link"
            animated={false}
            queryParams={inAppCompare ? null : forwardedGoogleParams}
            context={inAppCompare ? "in-app" : "auth"}
            returnTo={safeReturnTo}
          />
        </div>

        {/* Footer link */}
        {inAppCompare ? (
          <p className="mt-10 text-sm text-content-tertiary">
            ¿Prefieres volver sin cambiar tu plan?{" "}
            <Link
              href={safeReturnTo}
              className="font-semibold text-accent hover:underline transition"
            >
              Regresar al dashboard
            </Link>
          </p>
        ) : (
          <p className="mt-10 text-sm text-content-tertiary">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/auth/login"
              replace
              className="font-semibold text-accent hover:underline transition"
            >
              Inicia sesión
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}

export default function MembershipPage() {
  return (
    <Suspense>
      <MembershipContent />
    </Suspense>
  );
}
