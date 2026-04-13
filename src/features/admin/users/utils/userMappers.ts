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

function normalizeText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function splitFullName(name: string | null | undefined) {
  const normalized = normalizeText(name);

  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const parts = normalized.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function formatOptionalDate(
  value: string | null | undefined,
  fallback: string | null,
): string | null {
  const normalized = normalizeText(value);
  if (!normalized) return fallback;
  return formatUserDate(normalized);
}

export function mapBackendUserToAdmin(
  user: BackendUser,
  previous?: Partial<AdminUser>,
): AdminUser {
  const explicitFirstName =
    normalizeText(user.first_name) ?? normalizeText(user.firstName);
  const explicitLastName =
    normalizeText(user.last_name) ?? normalizeText(user.lastName);
  const splitName = splitFullName(user.name);
  const createdAtRaw =
    normalizeText(user.created_at) ?? normalizeText(user.createdAt);

  return {
    id: user.id,
    profile: normalizeText(user.profile) ?? previous?.profile ?? "user",
    firstName:
      explicitFirstName ?? splitName.firstName ?? previous?.firstName ?? "",
    lastName:
      explicitLastName ?? splitName.lastName ?? previous?.lastName ?? "",
    email: user.email,
    birthdate: formatOptionalDate(user.birthdate, previous?.birthdate ?? null),
    subscribed:
      typeof user.subscribed === "boolean"
        ? user.subscribed
        : typeof user.hasActiveSubscription === "boolean"
          ? user.hasActiveSubscription
          : previous?.subscribed ?? false,
    isGoogleUser:
      typeof user.is_google_user === "boolean"
        ? user.is_google_user
        : typeof user.isGoogleUser === "boolean"
          ? user.isGoogleUser
          : previous?.isGoogleUser ?? null,
    points:
      typeof user.points === "number" ? user.points : previous?.points ?? 0,
    kanaPoints:
      typeof user.kana_points === "number"
        ? user.kana_points
        : typeof user.kanaPoints === "number"
          ? user.kanaPoints
          : previous?.kanaPoints ?? null,
    createdAt: createdAtRaw
      ? formatUserDate(createdAtRaw)
      : previous?.createdAt ?? "",
  };
}
