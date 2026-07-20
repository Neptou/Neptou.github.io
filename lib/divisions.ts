import { authFetch } from "./auth";

export interface Division {
  id: string;
  country: string | null;
  state: string | null;
  district: string | null;
  municipality: string | null;
}

let divisionsCache: Division[] | null = null;

/**
 * Fetch (and cache) all place divisions. Shared by the district picker and the
 * festivals table so they don't each refetch. Pass force=true to refresh.
 */
export async function getDivisions(force = false): Promise<Division[]> {
  if (divisionsCache && !force) return divisionsCache;
  const res = await authFetch("/admin/divisions");
  if (!res.ok) throw new Error("Failed to load divisions");
  divisionsCache = (await res.json()) as Division[];
  return divisionsCache;
}

/** Human-readable label, most specific first: "Bhaktapur › Bhaktapur › Bagmati › Nepal". */
export function divisionLabel(d: Division): string {
  return [d.municipality, d.district, d.state, d.country]
    .filter(Boolean)
    .join(" › ");
}
