import "server-only";

export const serverNotificationsConfig = {
  internalApiKey:
    process.env.GOKAI_API_KEY?.trim() ??
    process.env.GOKAI_INTERNAL_API_KEY?.trim() ??
    process.env.INTERNAL_API_KEY?.trim() ??
    "",
  missingInternalApiKeyMessage:
    "Falta configurar la llave interna GOKAI_API_KEY del frontend para hablar con gokai-notifications-api. NEXT_PUBLIC_ONESIGNAL_APP_ID ya cubre el SDK web, pero no sustituye esta autenticacion interna. Agrega GOKAI_API_KEY en .env.local del frontend y reinicia Next.js.",
} as const;