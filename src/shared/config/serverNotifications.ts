import "server-only";

import { apiConfig } from "./api";

export const serverNotificationsConfig = {
  notificationsApiBase: apiConfig.notificationsApiBase,
  missingNotificationsApiBaseMessage:
    "Falta configurar la conexión con gokai-notifications-api. Puedes usar una URL/origen con GOKAI_NOTIFICATIONS_API_BASE o una ruta interna con GOKAI_NOTIFICATIONS_API_PATH.",
} as const;