export type UserRole = "HR" | "MANAGER" | "FINANCE" | "IT" | "ADMIN";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  first_name?: string | null;
  last_name?: string | null;
  profile_picture?: string | null;
}

export interface LoginResponse {
  user: AuthUser;
  access_token: string;
}

export interface StoredAuth {
  token: string;
  user: AuthUser;
}
