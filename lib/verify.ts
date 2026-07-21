import { authFetch } from "@/lib/auth";

/** Fields every verifiable admin record shares (foods, festivals, contacts, …). */
export interface VerifyFields {
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

/** Human-readable last-verified stamp (the column is a TIMESTAMPTZ ISO string). */
export function formatVerified(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * POST the one-click verify toggle for a resource and return its updated verify
 * fields. `basePath` is the resource collection path, e.g. "/admin/foods".
 * Content-Type must be set explicitly — `authFetch` only adds the auth header,
 * and FastAPI won't parse the JSON body (so `verified:false` un-verify) without it.
 */
export async function verifyRecord(
  basePath: string,
  id: string | number,
  verified: boolean
): Promise<VerifyFields> {
  const res = await authFetch(`${basePath}/${id}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ verified }),
  });
  if (!res.ok) throw new Error("verify failed");
  const row = await res.json();
  return {
    verified: row.verified,
    verified_at: row.verified_at,
    verified_by: row.verified_by,
  };
}
