export interface BackendUser {
  id: string;
  profile: string;
  birthdate: string;
  first_name: string;
  last_name: string;
  email: string;
  subscribed: boolean;
  is_google_user: boolean;
  points: number;
  kana_points: number;
  created_at: string;
}

export type AdminUserStatus = "active" | "subscribed" | "google";

export interface AdminUser {
  id: string;
  profile: string;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string;
  subscribed: boolean;
  isGoogleUser: boolean;
  points: number;
  kanaPoints: number;
  createdAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
}
