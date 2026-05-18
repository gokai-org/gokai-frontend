"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type CreditsAndAttributionsPanelProps = {
  onBack: () => void;
  onAccept: () => void;
};

function CreditsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border-default bg-surface-secondary/70 p-5 md:p-6">
      <h3 className="text-base font-semibold text-content-primary md:text-lg">
        {title}
      </h3>
      <div className="mt-3 space-y-3 text-sm leading-7 text-content-secondary">
        {children}
      </div>
    </section>
  );
}

function ResourceLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-accent transition-colors hover:text-accent-hover"
    >
      {children}
    </a>
  );
}

export function CreditsAndAttributionsPanel({
  onBack,
  onAccept,
}: CreditsAndAttributionsPanelProps) {
  return (
    <section
      id="landing-credits-panel"
      role="dialog"
      aria-labelledby="credits-title"
      className="h-[calc(100dvh-1rem)] max-h-[calc(100dvh-1rem)] min-h-0 overflow-y-auto overscroll-contain pr-1 sm:h-auto sm:max-h-[78dvh] sm:min-h-[min(70dvh,760px)] md:pr-3"
    >
      <div className="border-b border-border-subtle pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-content-muted md:text-[11px]">
          GOKAI
        </p>
        <h2
          id="credits-title"
          className="mt-2 text-xl font-semibold tracking-tight text-content-primary md:text-2xl"
        >
          Créditos y atribuciones
        </h2>
        <p className="mt-1.5 text-xs leading-5 text-content-tertiary md:text-sm">
          <strong>Última actualización:</strong> 17 de mayo de 2026
        </p>
      </div>

      <div className="mt-4 sm:mt-5">
        <CreditsSection title="Recursos visuales">
          <p>
            GOKAI utiliza distintos recursos visuales, gráficos y multimedia con
            fines educativos, informativos y de experiencia de usuario dentro de
            la plataforma.
          </p>
          <p>
            Parte de los recursos utilizados fueron obtenidos de bibliotecas de
            contenido libre y plataformas de recursos gráficos, respetando sus
            respectivas licencias y condiciones de uso.
          </p>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Pixabay
            </h4>
          <p>
            Algunas imágenes y recursos multimedia utilizados en esta
            plataforma provienen de Pixabay. Dichos contenidos son utilizados
            conforme a la Licencia de Contenido de Pixabay, la cual permite el
            uso y modificación de recursos libres de regalías para proyectos
            digitales y educativos.
          </p>
          <p>
            <strong>Sitio oficial:</strong>{" "}
            <ResourceLink href="https://pixabay.com/">
              https://pixabay.com/
            </ResourceLink>
          </p>
          </div>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Vecteezy
            </h4>
          <p>
            Algunos vectores, ilustraciones e imágenes utilizados dentro de la
            interfaz y materiales visuales de GOKAI provienen de Vecteezy.
            Estos recursos son utilizados conforme a los términos y condiciones
            establecidos por la plataforma y sus respectivas licencias de uso.
          </p>
          <p>
            <strong>Atribución correspondiente:</strong> Vectores e
            ilustraciones por Vecteezy.
          </p>
          <p>
            <strong>Sitio oficial:</strong>{" "}
            <ResourceLink href="https://www.vecteezy.com/">
              https://www.vecteezy.com/
            </ResourceLink>
          </p>
          </div>
          <div className="space-y-3 rounded-xl border border-border-default/70 bg-surface-primary/60 p-4">
            <h4 className="text-sm font-semibold text-content-primary md:text-base">
              Notas legales
            </h4>
          <p>
            Todos los logotipos, marcas comerciales y nombres mencionados
            pertenecen a sus respectivos propietarios.
          </p>
          <p>
            Los recursos externos utilizados dentro de GOKAI han sido
            modificados, adaptados o integrados como parte del diseño y
            experiencia visual de la plataforma, sin intención de
            redistribuirlos de manera independiente.
          </p>
          <p>
            Si algún autor o propietario considera necesaria una corrección de
            atribución o contenido, puede solicitarlo mediante los canales
            oficiales de contacto del proyecto.
          </p>
          </div>
        </CreditsSection>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2.5 border-t border-border-subtle pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:mt-5 sm:flex-row sm:justify-end sm:gap-3 sm:pt-5 sm:pb-0">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-default bg-surface-primary px-4 py-2.5 text-sm font-semibold text-content-secondary transition hover:border-accent/30 hover:text-content-primary focus:outline-none focus:ring-4 focus:ring-red-100"
        >
          Regresar
        </button>
        <motion.button
          type="button"
          onClick={onAccept}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-content-inverted shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-4 focus:ring-red-200"
        >
          Entendido
        </motion.button>
      </div>
    </section>
  );
}