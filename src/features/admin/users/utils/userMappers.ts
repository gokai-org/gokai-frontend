import type { AdminUser, BackendUser } from "../types/users";

export function formatUserDate(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  return d.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function mapBackendUserToAdmin(user: BackendUser): AdminUser {
  return {
    id: user.id,
    profile: user.profile ?? "user",
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    birthdate: formatUserDate(user.birthdate),
    subscribed: user.subscribed,
    isGoogleUser: user.is_google_user,
    points: user.points ?? 0,
    kanaPoints: user.kana_points ?? 0,
    createdAt: formatUserDate(user.created_at),
  };
}
