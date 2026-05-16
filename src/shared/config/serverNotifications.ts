import "server-only";

export const serverNotificationsConfig = {
  internalApiKey: process.env.GOKAI_API_KEY?.trim() ?? "",
  missingInternalApiKeyMessage:
    "Falta configurar GOKAI_API_KEY en .env.local del frontend y reiniciar Next.js",
} as const;