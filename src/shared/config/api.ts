function firstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return "";
}

const resolvedNotificationsApiBase = firstNonEmpty(
  process.env.GOKAI_NOTIFICATIONS_API_BASE,
  process.env.GOKAI_NOTIFICATIONS_API_URL,
  process.env.NOTIFICATIONS_API_BASE,
  process.env.NOTIFICATIONS_API_URL,
  process.env.GOKAI_NOTIFICATION_API_BASE,
  process.env.GOKAI_NOTIFICATION_API_URL,
);

export const apiConfig = {
  usersApiBase: process.env.GOKAI_USERS_API_BASE ?? "http://localhost:8080",
  contentApiBase: process.env.GOKAI_CONTENT_API_BASE ?? "http://localhost:8081",
  studyApiBase: process.env.GOKAI_STUDY_API_BASE ?? "http://localhost:8086",
  subscriptionsApiBase:
    process.env.GOKAI_SUBSCRIPTIONS_API_BASE ?? "http://localhost:8084",
  notificationsApiBase:
    resolvedNotificationsApiBase ||
    (process.env.NODE_ENV === "production" ? "" : "http://localhost:8083"),
} as const;
