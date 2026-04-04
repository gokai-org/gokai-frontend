"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AnimatedGraphBackground from "@/features/graph/components/AnimatedGraphBackground";
import { MembershipPicker } from "@/features/landing/components/MembershipPicker";

export default function MembershipPage() {
  const searchParams = useSearchParams();

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
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="inline-block">
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
            Elige tu plan
          </p>
          <h1 className="mt-2 text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-content-primary">
            Comienza tu camino en japonés
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base md:text-lg leading-relaxed text-content-secondary">
            Selecciona cómo quieres aprender. Siempre puedes mejorar tu plan
            después.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mt-12 w-full max-w-5xl">
          <MembershipPicker
            mode="link"
            animated={false}
            queryParams={forwardedGoogleParams}
          />
        </div>

        {/* Footer link */}
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
      </div>
    </main>
  );
}
