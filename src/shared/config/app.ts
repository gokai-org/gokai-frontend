export const appConfig = {
  isProduction: process.env.NODE_ENV === "production",
  useMocks: process.env.NEXT_PUBLIC_USE_MOCKS === "false",
} as const;