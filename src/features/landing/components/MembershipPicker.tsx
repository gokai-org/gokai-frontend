"use client";

import { PlanCard } from "@/features/landing";

type MembershipPickerContext = "auth" | "in-app";

interface MembershipPickerProps {
  mode?: "link" | "button";
  animated?: boolean;
  queryParams?: URLSearchParams | null;
  context?: MembershipPickerContext;
  returnTo?: string | null;
}

function appendQuery(
  baseHref: string,
  params?: URLSearchParams | null,
): string {
  if (!params) return baseHref;

  const query = params.toString();
  if (!query) return baseHref;

  const separator = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${separator}${query}`;
}

export function MembershipPicker({
  mode = "link",
  animated = true,
  queryParams = null,
  context = "auth",
  returnTo = null,
}: MembershipPickerProps) {
  const safeReturnTo =
    typeof returnTo === "string" && returnTo.startsWith("/")
      ? returnTo
      : null;
  const inAppContext = context === "in-app";
  const freeHref = inAppContext
    ? safeReturnTo ?? "/dashboard/graph"
    : "/auth/login?mode=register&intent=free";
  const premiumHref = inAppContext
    ? safeReturnTo
      ? `/checkout?returnTo=${encodeURIComponent(safeReturnTo)}`
      : "/checkout"
    : "/auth/login?mode=register&intent=premium";

  const plans = [
    {
      title: "Gratis",
      price: "$0",
      description: "Empieza a aprender japonés con acceso esencial.",
      features: [
        "Acceso inicial a contenido básico",
        "Exploración de funciones principales",
        "Progreso guardado en tu cuenta",
      ],
      href: freeHref,
      ctaLabel: inAppContext
        ? "Seguir con plan gratis"
        : mode === "link"
          ? "Comenzar gratis"
          : "Seleccionar",
      highlighted: false,
      badge: inAppContext ? "Plan actual" : undefined,
    },
    {
      title: "GOKAI+",
      price: "$229 MXN",
      description: "Desbloquea toda la experiencia premium de aprendizaje.",
      features: [
        "Acceso completo a lecciones y contenido",
        "Funciones avanzadas y práctica extendida",
        "Experiencia más completa y personalizada",
      ],
      href: premiumHref,
      ctaLabel: inAppContext
        ? "Actualizar a GOKAI+"
        : mode === "link"
          ? "Desbloquear GOKAI+"
          : "Seleccionar",
      highlighted: true,
      badge: "Más popular",
    },
  ];

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 lg:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard
          key={plan.title}
          {...plan}
          href={appendQuery(plan.href, inAppContext ? null : queryParams)}
          animated={animated}
        />
      ))}
    </div>
  );
}
