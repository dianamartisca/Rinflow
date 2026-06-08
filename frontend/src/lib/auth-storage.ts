import type { LoginResponse, StoredAuth } from "@/types/auth";

const AUTH_STORAGE_KEY = "rinflow.auth";

export function getStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.token || !parsed?.user?.role) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function storeAuth(auth: LoginResponse): void {
  if (typeof window === "undefined") {
    return;
  }

  const payload: StoredAuth = {
    token: auth.access_token,
    user: auth.user,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
}
