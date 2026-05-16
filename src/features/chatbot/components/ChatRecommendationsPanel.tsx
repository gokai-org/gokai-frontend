"use client";

import { useRouter } from "next/navigation";
import type { ChatbotRecommendation } from "@/features/chatbot/types";

interface ChatRecommendationsPanelProps {
  recommendations: ChatbotRecommendation[];
  currentChatName?: string;
  onClose?: () => void;
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

function getRecommendationAction(recommendation: ChatbotRecommendation) {
  switch (recommendation.lessonType) {
    case "subtheme":
      return {
        href: `/dashboard/graph?subthemeId=${encodeURIComponent(recommendation.entityId)}`,
        label: "Ir al mapa",
      };
    case "theme":
      return {
        href: `/dashboard/graph?themeId=${encodeURIComponent(recommendation.entityId)}`,
        label: "Ir al mapa",
      };
    case "grammar":
      return {
        href: "/dashboard/graph/grammar",
        label: "Ir al tablero",
      };
    case "kanji":
      return {
        href: `/dashboard/library?category=kanji&entityId=${encodeURIComponent(recommendation.entityId)}`,
        label: "Ir a kanji",
      };
    case "hiragana":
      return {
        href: `/dashboard/library?category=hiragana&entityId=${encodeURIComponent(recommendation.entityId)}`,
        label: "Ir a hiragana",
      };
    case "katakana":
      return {
        href: `/dashboard/library?category=katakana&entityId=${encodeURIComponent(recommendation.entityId)}`,
        label: "Ir a katakana",
      };
    default:
      return {
        href: "/dashboard/library",
        label: "Ir a estudiar",
      };
  }
}

export function ChatRecommendationsPanel({
  recommendations,
  currentChatName,
  onClose,
}: ChatRecommendationsPanelProps) {
  const router = useRouter();
  const compactMobileLayout = Boolean(onClose);

  return (
    <section
      data-help-target="chat-recommendations-panel"
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-[30px] border border-border-subtle bg-surface-elevated shadow-[0_2px_18px_-8px_rgba(0,0,0,0.08)]"
    >
      <div className={`shrink-0 border-b border-border-subtle bg-surface-primary ${compactMobileLayout ? "px-3 py-3 sm:px-5 sm:py-4" : "px-4 py-4 sm:px-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`${compactMobileLayout ? "text-base sm:text-lg" : "text-lg"} font-extrabold text-content-primary`}>
              Espacio de recomendaciones
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/8 px-3 py-1 text-xs font-semibold text-accent">
              {recommendations.length}
            </span>

            {onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border-default bg-surface-elevated text-content-secondary transition hover:border-accent/30 hover:text-accent"
                aria-label="Cerrar recomendaciones"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6 18 18" />
                  <path d="M18 6 6 18" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`min-h-0 flex-1 overflow-y-auto ${compactMobileLayout ? "px-3 py-3 sm:px-5 sm:py-4" : "px-4 py-4 sm:px-5"}`}>
        {recommendations.length === 0 ? (
          <div className="flex h-full min-h-[220px] items-center justify-center rounded-[26px] border border-dashed border-border-default bg-surface-primary px-6 text-center">
            <div>
              <h4 className="text-base font-bold text-content-primary">
                Aun no hay sugerencias activas
              </h4>
              <p className="mt-2 text-sm leading-6 text-content-tertiary">
                Cada nueva recomendacion aparecera aqui para que tengas una vista fija del contenido que conviene estudiar despues de conversar con KAZU.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recommendations.map((recommendation) => (
              <article
                key={recommendation.id}
                className={`rounded-[24px] border border-accent/12 bg-surface-primary shadow-sm ${compactMobileLayout ? "px-3 py-3.5 sm:px-4 sm:py-4" : "px-4 py-4"}`}
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

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      const action = getRecommendationAction(recommendation);
                      onClose?.();
                      router.push(action.href);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/8 px-3.5 py-2 text-xs font-semibold text-accent transition hover:border-accent/30 hover:bg-accent/12"
                  >
                    {getRecommendationAction(recommendation).label}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}