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
  twoFactorEnabled?: boolean;
}

export interface UserInterest {
  categoryId: string;
  interestId: string;
}

export interface InterestsResponse {
  interests: UserInterest[];
}
