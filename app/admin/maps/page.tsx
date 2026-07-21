"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError, getMe, canAccess, type Me } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import PlaceModal from "@/components/PlaceModal";
import type { Place } from "@/components/PlacesTable";
import PlaceFilters, {
  buildPlaceQuery,
  emptyFilters,
  type Filters,
  type FilterOptions,
} from "@/components/PlaceFilters";

type MapType = "k" | "m" | "h"; // satellite / map / hybrid (Google legacy t= param)
type MapMode = "coords" | "search"; // stored pin vs search-by-name

const MAP_TYPES: { key: MapType; label: string }[] = [
  { key: "k", label: "Satellite" },
  { key: "m", label: "Map" },
  { key: "h", label: "Hybrid" },
];

/**
 * Build a KEYLESS Google Maps embed URL (no API key, legacy iframe endpoint).
 *  - "coords" mode: q=<lat>,<lng> drops a pin at the stored coordinates.
 *  - "search" mode: q=<name>, Nepal so staff can see where Google itself finds
 *    the place and compare against the stored pin.
 * t=k satellite, t=m map, t=h hybrid; output=embed makes it iframe-safe.
 */
function embedUrl(place: Place, mode: MapMode, type: MapType): string {
  const q =
    mode === "search"
      ? encodeURIComponent(`${place.name}, Nepal`)
      : `${place.latitude},${place.longitude}`;
  return `https://maps.google.com/maps?q=${q}&z=17&t=${type}&output=embed`;
}

/** Human-readable last-verified stamp (the column is a TIMESTAMPTZ ISO string). */
function formatVerified(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function districtLabel(place: Place): string {
  return [place.district, place.state, place.country].filter(Boolean).join(", ") || "—";
}

export default function MapsPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [options, setOptions] = useState<FilterOptions>({
    countries: [],
    states: [],
    districts: [],
    municipalities: [],
  });
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [mapType, setMapType] = useState<MapType>("k");
  const [mapMode, setMapMode] = useState<MapMode>("coords");
  const [editing, setEditing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Gate on load + fetch the filter dropdown options (same source as the dashboard).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me: Me = await getMe();
        if (cancelled) return;
        if (!canAccess(me, "places")) {
          setAuthorized(false);
          return;
        }
        setAuthorized(true);
        const res = await authFetch("/admin/places/filters");
        if (!res.ok) throw new Error();
        if (!cancelled) setOptions(await res.json());
      } catch (e) {
        if (e instanceof AuthError) return;
        // Non-fatal — the dropdowns just stay empty until options arrive.
        if (!cancelled) setAuthorized((prev) => prev ?? true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = buildPlaceQuery(filters);
    // Raise the cap so a whole filtered set loads in one shot (default is 100).
    params.set("limit", "500");

    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`/admin/places?${params}`);
      if (!res.ok) throw new Error();
      const rows: Place[] = await res.json();
      setPlaces(rows);
      setSelectedId(rows.length ? rows[0].id : null);
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load places.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(emptyFilters);
    setPlaces(null);
    setSelectedId(null);
    setError("");
  }

  const selected = places?.find((p) => p.id === selectedId) ?? null;
  const hasCoords = selected?.latitude != null && selected?.longitude != null;

  function replaceSelected(updated: Partial<Place>) {
    setPlaces((prev) =>
      prev
        ? prev.map((p) => (p.id === selectedId ? { ...p, ...updated } : p))
        : prev
    );
  }

  function handleSaved(saved: Place) {
    // PlaceModal PUT returns the full row (coords + server-recomputed geohash).
    setPlaces((prev) => (prev ? prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p)) : prev));
    setEditing(false);
  }

  async function handleVerify(verified: boolean) {
    if (!selected) return;
    setVerifying(true);
    setError("");
    try {
      const res = await authFetch(`/admin/places/${selected.id}/verify-coordinates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });
      if (!res.ok) throw new Error();
      const row = await res.json();
      replaceSelected({
        coordinates_verified: row.coordinates_verified,
        coordinates_verified_at: row.coordinates_verified_at,
        coordinates_verified_by: row.coordinates_verified_by,
      });
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to update verification.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Maps</h1>
          <p className="text-gray-400 text-sm mt-1">
            Verify that stored place coordinates land on the right spot
          </p>
        </div>

        {authorized === false && (
          <p className="text-gray-400 text-center py-16">
            You need Places access to verify coordinates.
          </p>
        )}

        {authorized && (
          <>
            <PlaceFilters
              filters={filters}
              options={options}
              onChange={update}
              onSubmit={handleSearch}
              onReset={handleReset}
              loading={loading}
            />

            {error && <p className="text-red-400 mb-4">{error}</p>}

            {places === null && !loading && (
              <p className="text-gray-500 text-center py-16">
                Use the filters above and click Search to begin verifying.
              </p>
            )}

            {places !== null && (
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,380px)_1fr] gap-6">
                {/* Left: place list */}
                <div className="rounded-xl border border-gray-800 overflow-hidden flex flex-col max-h-[70vh]">
                  <div className="px-4 py-2 bg-gray-900 text-xs text-gray-400 uppercase tracking-wider">
                    {places.length} place{places.length !== 1 ? "s" : ""}
                  </div>
                  <div className="overflow-y-auto divide-y divide-gray-800">
                    {places.length === 0 && (
                      <p className="px-4 py-8 text-center text-gray-500 text-sm">No places found.</p>
                    )}
                    {places.map((p) => {
                      const verified = p.coordinates_verified === true;
                      const vDate = formatVerified(p.coordinates_verified_at);
                      const active = p.id === selectedId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedId(p.id);
                            setMapMode("coords");
                          }}
                          className={
                            "w-full text-left px-4 py-3 transition-colors " +
                            (active ? "bg-gray-800" : "hover:bg-gray-900/60")
                          }
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-medium text-white text-sm truncate">{p.name}</span>
                            {verified ? (
                              <span className="text-emerald-400 text-xs whitespace-nowrap">✓ Verified</span>
                            ) : (
                              <span className="text-gray-500 text-xs whitespace-nowrap">○ Needs review</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">
                            {p.latitude != null && p.longitude != null
                              ? `${p.latitude.toFixed(5)}, ${p.longitude.toFixed(5)}`
                              : "no coordinates"}
                          </div>
                          {verified && vDate && (
                            <div className="text-[11px] text-gray-600 mt-0.5">Verified {vDate}</div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: map + detail */}
                <div className="rounded-xl border border-gray-800 p-4">
                  {!selected ? (
                    <p className="text-gray-500 text-center py-16">Select a place from the list.</p>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                        <div className="flex items-center gap-3">
                          {selected.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={selected.image_url}
                              alt={selected.name}
                              className="w-14 h-14 rounded-lg object-cover border border-gray-700"
                            />
                          )}
                          <div>
                            <h2 className="text-lg font-semibold text-white">{selected.name}</h2>
                            <p className="text-xs text-gray-400">{districtLabel(selected)}</p>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">
                              {hasCoords
                                ? `${selected.latitude!.toFixed(5)}, ${selected.longitude!.toFixed(5)}`
                                : "no coordinates"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {selected.coordinates_verified ? (
                            <span className="text-emerald-400 text-sm">✓ Verified</span>
                          ) : (
                            <span className="text-gray-500 text-sm">○ Needs review</span>
                          )}
                          {selected.coordinates_verified && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              {formatVerified(selected.coordinates_verified_at) ?? ""}
                              {selected.coordinates_verified_by ? ` · ${selected.coordinates_verified_by}` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
                          {(["coords", "search"] as MapMode[]).map((m) => (
                            <button
                              key={m}
                              onClick={() => setMapMode(m)}
                              className={
                                "px-3 py-1.5 text-xs transition-colors " +
                                (mapMode === m ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white")
                              }
                            >
                              {m === "coords" ? "Stored coordinates" : "Search by name"}
                            </button>
                          ))}
                        </div>
                        <div className="inline-flex rounded-lg border border-gray-700 overflow-hidden">
                          {MAP_TYPES.map((t) => (
                            <button
                              key={t.key}
                              onClick={() => setMapType(t.key)}
                              className={
                                "px-3 py-1.5 text-xs transition-colors " +
                                (mapType === t.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white")
                              }
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Keyless Google Maps embed */}
                      {mapMode === "coords" && !hasCoords ? (
                        <div className="w-full h-[420px] rounded-lg border border-gray-800 flex items-center justify-center text-gray-500 text-sm">
                          No stored coordinates — switch to “Search by name”, then Edit to add them.
                        </div>
                      ) : (
                        <iframe
                          key={`${selected.id}-${mapMode}-${mapType}`}
                          title={`Map of ${selected.name}`}
                          src={embedUrl(selected, mapMode, mapType)}
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          className="w-full h-[420px] rounded-lg border border-gray-800"
                        />
                      )}

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-3 mt-4">
                        {hasCoords && (
                          <a
                            href={`https://www.google.com/maps?q=${selected.latitude},${selected.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Open in Google Maps ↗
                          </a>
                        )}
                        <span className="flex-1" />
                        <button
                          onClick={() => setEditing(true)}
                          className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Edit coordinates
                        </button>
                        {selected.coordinates_verified ? (
                          <button
                            onClick={() => handleVerify(false)}
                            disabled={verifying}
                            className="text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 px-4 py-2 rounded-lg transition-colors"
                          >
                            {verifying ? "…" : "Un-verify"}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerify(true)}
                            disabled={verifying || !hasCoords}
                            className="text-sm bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            {verifying ? "Saving…" : "Mark verified"}
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {editing && selected && (
        <PlaceModal mode="edit" place={selected} onSaved={handleSaved} onClose={() => setEditing(false)} />
      )}
    </div>
  );
}
