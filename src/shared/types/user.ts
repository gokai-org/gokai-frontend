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

export interface FavoriteItem {
  id: string;
  type: "lesson" | "exercise" | "kanji" | "article";
  addedAt: string;
}

export interface FavoritesResponse {
  favorites: FavoriteItem[];
}

export interface RecentItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  progress?: number;
  level?: string;
  category?: string;
  lastAccessed: string;
}

export interface RecentItemsResponse {
  recentItems: RecentItem[];
}

export interface UserInterest {
  categoryId: string;
  interestId: string;
}

export interface InterestsResponse {
  interests: UserInterest[];
}
