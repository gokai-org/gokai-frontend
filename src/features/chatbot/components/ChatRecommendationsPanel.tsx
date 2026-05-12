"use client";

import type { ChatbotRecommendation } from "@/features/chatbot/types";

interface ChatRecommendationsPanelProps {
  recommendations: ChatbotRecommendation[];
  currentChatName?: string;
}

function getLessonTypeLabel(lessonType: string) {
  switch (lessonType) {
    case "subtheme":
      return "Subtema";
    case "theme":
      return "Tema";
    case "grammar":
      return "Gramatica";
    case "kanji":
      return "Kanji";
    default:
      return "Leccion";
  }
}

export function ChatRecommendationsPanel({
  recommendations,
  currentChatName,
}: ChatRecommendationsPanelProps) {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]">
      <div className="shrink-0 border-b border-border-subtle bg-surface-primary px-4 py-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-content-primary">
              Espacio de recomendaciones
            </h3>
          </div>

          <span className="rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
            {recommendations.length}
          </span>
        </div>

        {currentChatName ? (
          <div className="mt-3 inline-flex rounded-full border border-border-default bg-surface-elevated px-3 py-1 text-xs font-semibold text-content-secondary">
            {currentChatName}
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        {recommendations.length === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center rounded-[26px] border border-dashed border-border-default bg-surface-primary px-6 text-center">
            <div>
              <h4 className="text-base font-bold text-content-primary">
                Aun no hay sugerencias activas
              </h4>
              <p className="mt-2 text-sm leading-6 text-content-tertiary">
                Cada nueva recomendacion aparecera aqui para que tengas una vista fija del contenido que conviene estudiar despues de conversar con Sensei AI.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <article
                key={recommendation.id}
                className="rounded-[24px] border border-accent/12 bg-surface-primary px-4 py-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                    {getLessonTypeLabel(recommendation.lessonType)}
                  </span>
                  <span className="text-xs font-medium text-content-muted">
                    {recommendation.createdAt.toLocaleString("es-MX", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <h4 className="mt-3 text-base font-bold text-content-primary">
                  {recommendation.description}
                </h4>
                <p className="mt-2 text-sm leading-6 text-content-tertiary">
                  Puedes usar esta sugerencia como punto de partida para memorizar el tema, preguntar mas ejemplos en el chat y luego intentar construir tus propias respuestas.
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}