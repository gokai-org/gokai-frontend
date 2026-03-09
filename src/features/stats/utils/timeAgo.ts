/**
 * Convierte una fecha ISO 8601 en un texto relativo en español.
 * Ejemplo: "2026-06-15T14:30:00Z" → "hace 2 h"
 */
export function timeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.max(0, now - then);

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return "hace un momento";
  if (minutes < 60) return `hace ${minutes} min`;
  if (hours < 24) return `hace ${hours} h`;
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} d`;
  if (weeks < 5) return `hace ${weeks} sem`;
  return `hace ${months} mes${months !== 1 ? "es" : ""}`;
}
