export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  birthdate?: string;
  profile?: string;
  avatar?: string | null;
  plan?: string;
  createdAt?: string;
  twoFactorEnabled?: boolean;
}
