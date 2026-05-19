import "server-only";

import { apiConfig } from "./api";

export const serverNotificationsConfig = {
  internalApiKey:
    process.env.GOKAI_API_KEY?.trim() ??
    process.env.GOKAI_INTERNAL_API_KEY?.trim() ??
    process.env.INTERNAL_API_KEY?.trim() ??
    "",
  notificationsApiBase: apiConfig.notificationsApiBase,
  missingInternalApiKeyMessage:
    "Falta configurar la llave interna GOKAI_API_KEY del frontend para hablar con gokai-notifications-api. NEXT_PUBLIC_ONESIGNAL_APP_ID ya cubre el SDK web, pero no sustituye esta autenticacion interna. Agrega GOKAI_API_KEY en .env.local del frontend y reinicia Next.js.",
  missingNotificationsApiBaseMessage:
    "Falta configurar la URL privada del gokai-notifications-api en el frontend. Define GOKAI_NOTIFICATIONS_API_BASE en deploy o usa alguno de estos aliases: GOKAI_NOTIFICATIONS_API_URL, NOTIFICATIONS_API_BASE, NOTIFICATIONS_API_URL.",
} as const;