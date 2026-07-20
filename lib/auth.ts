import { BACKEND_URL } from "./config";

const TOKEN_KEY = "admin_token";

/** Canonical resource keys (mirrors backend deps.RESOURCES) with display labels. */
export const RESOURCES: { key: string; label: string }[] = [
  { key: "places", label: "Places" },
  { key: "foods", label: "Foods" },
  { key: "festivals", label: "Festivals" },
  { key: "divisions", label: "Divisions" },
  { key: "emergency_contacts", label: "Emergency Contacts" },
];

export type AdminRole = "super_admin" | "admin";

export interface Me {
  id: number;
  username: string;
  role: AdminRole;
  permissions: string[];
  is_active: boolean;
}

let meCache: Me | null = null;

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  meCache = null;
}

/**
 * Fetch (and cache) the logged-in admin's identity + role/permissions.
 * The JWT is opaque to the client, so role-based UI gating comes from here.
 * Pass force=true to bypass the cache after a change.
 */
export async function getMe(force = false): Promise<Me> {
  if (meCache && !force) return meCache;
  const res = await authFetch("/admin/me");
  if (!res.ok) throw new Error("Failed to load current admin");
  meCache = (await res.json()) as Me;
  return meCache;
}

export function isSuperAdmin(me: Me | null): boolean {
  return me?.role === "super_admin";
}

/** True if the admin may access a resource (super admins may access everything). */
export function canAccess(me: Me | null, resource: string): boolean {
  if (!me) return false;
  return me.role === "super_admin" || me.permissions.includes(resource);
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
