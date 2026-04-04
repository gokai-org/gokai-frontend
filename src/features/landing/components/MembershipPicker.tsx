"use client";

import { PlanCard } from "@/features/landing";

interface MembershipPickerProps {
  mode?: "link" | "button";
  animated?: boolean;
  queryParams?: URLSearchParams | null;
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
}: MembershipPickerProps) {
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
      href: "/auth/login?mode=register&intent=free",
      ctaLabel: mode === "link" ? "Comenzar gratis" : "Seleccionar",
      highlighted: false,
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
      href: "/auth/login?mode=register&intent=premium",
      ctaLabel: mode === "link" ? "Desbloquear GOKAI+" : "Seleccionar",
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
          href={appendQuery(plan.href, queryParams)}
          animated={animated}
        />
      ))}
    </div>
  );
}
