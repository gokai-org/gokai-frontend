import type { Metadata } from "next";
import Link from "next/link";
import { PrivacyPolicyPanel } from "@/features/legal/components/PrivacyPolicyPanel";

export const metadata: Metadata = {
  title: "Política de Privacidad | GOKAI",
  description:
    "Conoce cómo GOKAI recopila, utiliza, comparte y protege los datos personales dentro de la plataforma.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface-secondary px-4 py-6 text-content-primary sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl rounded-[28px] border border-border-default/70 bg-surface-primary/95 p-5 shadow-[var(--shadow-xl)] backdrop-blur md:p-8">
        <Link
          href="/"
          className="text-sm font-semibold text-accent transition hover:text-accent-hover"
        >
          Volver al inicio
        </Link>

        <div className="mt-4">
          <PrivacyPolicyPanel hideActions />
        </div>
      </div>
    </main>
  );
}
