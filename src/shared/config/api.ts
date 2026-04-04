export const apiConfig = {
  usersApiBase: process.env.GOKAI_USERS_API_BASE ?? "http://localhost:8080",
  contentApiBase: process.env.GOKAI_CONTENT_API_BASE ?? "http://localhost:8081",
  studyApiBase: process.env.GOKAI_STUDY_API_BASE ?? "http://localhost:8086",
  subscriptionsApiBase:
    process.env.GOKAI_SUBSCRIPTIONS_API_BASE ?? "http://localhost:8084",
} as const;
