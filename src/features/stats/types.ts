/* ── Streak (existente) ─────────────────────────────────── */

export type Streak = {
  id: string;
  user_id: string;
  created_at: string;
  ended_at: string | null;
};

/* ── Respuesta de error estándar ───────────────────────── */

/**
 * Formato uniforme de respuesta de error para todos los endpoints de stats.
 *
 * | status | significado                                      |
 * |--------|--------------------------------------------------|
 * | 400    | Parámetros de consulta inválidos                 |
 * | 401    | Token ausente o expirado (redirige a /auth/login)|
 * | 500    | Error interno del servidor                       |
 */
export interface ApiErrorResponse {
  error: string;
}

/* ── Período de consulta ───────────────────────────────── */

export type StatsPeriod = "week" | "month" | "all";

/* ── Overview (tarjetas resumen) ───────────────────────── */

export interface OverviewStatsResponse {
  study_hours: number;
  study_hours_trend: number;
  kanji_learned: number;
  kanji_learned_trend: number;
  hiragana_learned: number;
  hiragana_learned_trend: number;
  katakana_learned: number;
  katakana_learned_trend: number;
  accuracy: number;
  accuracy_trend: number;
  current_streak: number;
  reviews_completed: number;
  reviews_completed_trend: number;
}

/* ── Actividad semanal ─────────────────────────────────── */

export interface WeeklyActivityEntry {
  day: string;
  minutes: number;
}

/* ── Progreso mensual ──────────────────────────────────── */

export interface MonthlyProgressEntry {
  month: string;
  score: number;
  reviews: number;
}

/* ── Respuesta combinada de actividad ─────────────────
 *  Este endpoint NO recibe parámetros. Siempre devuelve ambas vistas.
 */

export interface ActivityResponse {
  weekly: WeeklyActivityEntry[];
  monthly: MonthlyProgressEntry[];
}

/* ── Habilidades (radar) ───────────────────────────────── */

export interface SkillEntry {
  /** Nombre de la habilidad (ej. "Kanji", "Gramática") */
  skill: string;
  /** Dominio 0–100 (porcentaje de dominio del usuario en esta habilidad) */
  value: number;
}

/* ── Distribución de progreso (donut) ──────────────────── */

export interface DistributionCategory {
  /** Nombre de la categoría (ej. "Kanji", "Hiragana") */
  label: string;
  /** Porcentaje del total (todas las categories deben sumar 100) */
  value: number;
}

export interface SkillsResponse {
  skills: SkillEntry[];
  distribution: {
    /** Total absoluto de contenidos estudiados por el usuario */
    total: number;
    /** Porcentaje por categoría (deben sumar 100) */
    categories: DistributionCategory[];
  };
}

/* ── Actividad reciente ────────────────────────────────── */

export interface RecentActivityEntry {
  id: string;
  type: "kanji" | "hiragana" | "katakana" | "vocabulary" | "grammar" | "review";
  title: string;
  description: string;
  /**
   * Fecha/hora en formato ISO 8601 (ej. "2026-06-15T14:30:00Z").
   * El frontend se encarga de formatearla como texto relativo ("hace 2 h").
   */
  created_at: string;
  /**
   * Puntuación 0-100. Presente solo para tipos con evaluación
   * (kanji, hiragana, katakana, vocabulary, grammar).
   * Omitido (no null) para tipo "review".
   */
  score?: number;
}

export interface RecentActivityResponse {
  activities: RecentActivityEntry[];
}

/* ── Calendario de racha ───────────────────────────────── */

export interface StreakCalendarResponse {
  /**
   * Mapa de fecha ISO → minutos estudiados, ej. { "2026-03-01": 45 }.
   * SIEMPRE incluye TODAS las fechas del rango solicitado.
   * Los días sin actividad aparecen con valor `0` (nunca se omiten).
   */
  streak_days: Record<string, number>;
  current_streak: number;
  longest_streak: number;
}

/* ── Datos agregados (usado por el hook) ───────────────── */

export interface StatsData {
  overview: OverviewStatsResponse | null;
  activity: ActivityResponse | null;
  skills: SkillsResponse | null;
  recentActivity: RecentActivityResponse | null;
  streakCalendar: StreakCalendarResponse | null;
}
