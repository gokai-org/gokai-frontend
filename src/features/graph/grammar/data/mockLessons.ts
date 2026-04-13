import type { GrammarLessonSummary } from "../types";

/**
 * 25 mock grammar lessons used to fill the board tree
 * when fewer than 25 real lessons exist in the backend.
 * These nodes are marked as locked/coming-soon.
 */
export const MOCK_GRAMMAR_LESSONS: GrammarLessonSummary[] = [
  { id: "mock-01", title: "La oración afirmativa, negativa e interrogativa (Desu / Ja arimasen / Ka)", pointsToUnlock: 0 },
  { id: "mock-02", title: "Las partículas は, が, を — marcadores de tema, sujeto y objeto", pointsToUnlock: 30 },
  { id: "mock-03", title: "Verbos en presente — Forma ~ます (masu form)", pointsToUnlock: 60 },
  { id: "mock-04", title: "Verbos en presente negativo — Forma ~ません (masen form)", pointsToUnlock: 90 },
  { id: "mock-05", title: "Verbos en pasado — Forma ~ました (mashita form)", pointsToUnlock: 120 },
  { id: "mock-06", title: "Verbos en pasado negativo — Forma ~ませんでした", pointsToUnlock: 150 },
  { id: "mock-07", title: "La partícula に (ni) — dirección, destino y tiempo", pointsToUnlock: 180 },
  { id: "mock-08", title: "La partícula で (de) — lugar de acción y medio", pointsToUnlock: 210 },
  { id: "mock-09", title: "La partícula へ (e) — dirección y movimiento", pointsToUnlock: 240 },
  { id: "mock-10", title: "Adjetivos い (i-adjectives) — conjugación y uso", pointsToUnlock: 270 },
  { id: "mock-11", title: "Adjetivos な (na-adjectives) — conjugación y uso", pointsToUnlock: 300 },
  { id: "mock-12", title: "Adjetivos en pasado y forma negativa", pointsToUnlock: 330 },
  { id: "mock-13", title: "Demostrativos: これ, それ, あれ (kore, sore, are)", pointsToUnlock: 360 },
  { id: "mock-14", title: "Demostrativos de lugar: ここ, そこ, あそこ (koko, soko, asoko)", pointsToUnlock: 390 },
  { id: "mock-15", title: "Números, contadores y cuantificadores básicos", pointsToUnlock: 420 },
  { id: "mock-16", title: "Expresiones de tiempo — horas, días y fechas", pointsToUnlock: 450 },
  { id: "mock-17", title: "Forma て (te-form) de verbos — uso y conjugación", pointsToUnlock: 480 },
  { id: "mock-18", title: "Verbo + ている (te iru) — acciones en progreso y estado", pointsToUnlock: 510 },
  { id: "mock-19", title: "Verbos de existencia: います y あります", pointsToUnlock: 540 },
  { id: "mock-20", title: "Forma de deseo: たい (tai form) — querer hacer algo", pointsToUnlock: 570 },
  { id: "mock-21", title: "Dar y recibir: あげる, もらう, くれる", pointsToUnlock: 600 },
  { id: "mock-22", title: "Oraciones condicionales: と, たら, ば, なら", pointsToUnlock: 630 },
  { id: "mock-23", title: "Causa y razón: から (kara) y ので (node)", pointsToUnlock: 660 },
  { id: "mock-24", title: "Permiso y prohibición: てもいい, てはいけない", pointsToUnlock: 690 },
  { id: "mock-25", title: "Secuencia de acciones con la forma て (te-form)", pointsToUnlock: 720 },
];

export const GRAMMAR_BOARD_TOTAL = 25;
