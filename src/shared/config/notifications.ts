export const notificationsConfig = {
  oneSignalAppId:
    process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID ??
    "bc8ba5b3-be3c-4cf2-85c7-67bea1145208",
} as const;