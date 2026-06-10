import { BACKEND_URL } from "./config";

const TOKEN_KEY = "admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

/** Thrown by authFetch when the user is being redirected to login — catch and ignore. */
export class AuthError extends Error {}

/**
 * Fetch an admin endpoint with the Bearer token attached.
 * Missing token or a 401 response redirects to the login page and throws
 * AuthError. This is the only auth gate on the static site — there is no
 * middleware at runtime; the backend's JWT check is the real enforcement.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    redirectToLogin();
    throw new AuthError("Not authenticated");
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  });

  if (res.status === 401) {
    clearToken();
    redirectToLogin();
    throw new AuthError("Session expired");
  }

  return res;
}

function redirectToLogin(): void {
  if (typeof window !== "undefined") window.location.assign("/admin/login/");
}
