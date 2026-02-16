export { LoginHistoryHandler } from "./components/LoginHistoryHandler";
export { default as ProgressDots } from "./components/ProgressDots";
export { useAuthProtection } from "./hooks/useAuthProtection";
export type { User, UserInterest, InterestsResponse } from "./types";
export { getCurrentUser, updateUserEmail, updateUserPassword, toggleTwoFactor, exportUserData, deleteUserAccount, getUserInterests, saveUserInterests, updateUserInterests } from "./services/api";
