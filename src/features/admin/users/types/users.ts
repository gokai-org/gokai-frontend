export interface BackendUser {
  id: string;
  profile?: string | null;
  birthdate?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email: string;
  subscribed?: boolean;
  hasActiveSubscription?: boolean;
  is_google_user?: boolean;
  isGoogleUser?: boolean;
  points?: number;
  kana_points?: number;
  kanaPoints?: number;
  created_at?: string;
  createdAt?: string;
}

export type AdminUserStatus = "active" | "subscribed" | "google";

export interface AdminUser {
  id: string;
  profile: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string | null;
  subscribed: boolean;
  isGoogleUser: boolean | null;
  points: number;
  kanaPoints: number | null;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
}
