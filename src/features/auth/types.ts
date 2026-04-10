export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  birthdate?: string;
  profile?: string;
  avatar?: string | null;
  plan?: "free" | "premium" | "pro";
  createdAt?: string;
  subscribed?: boolean;
  twoFactorEnabled?: boolean;
  points?: number;
  kanaPoints?: number;
}

export interface UserInterest {
  categoryId: string;
  interestId: string;
}

export interface InterestsResponse {
  interests: UserInterest[];
}
