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
type MapMode = "coords" | "search" | "compare"; // stored pin / name search / both

const MAP_TYPES: { key: MapType; label: string }[] = [
  { key: "k", label: "Satellite" },
  { key: "m", label: "Map" },
  { key: "h", label: "Hybrid" },
];

const MAP_MODES: { key: MapMode; label: string }[] = [
  { key: "compare", label: "Side by side" },
  { key: "coords", label: "Stored coordinates" },
  { key: "search", label: "Search by name" },
];

/**
 * Build a KEYLESS Google Maps embed URL (no API key, legacy iframe endpoint).
 *  - "coords" mode: q=<lat>,<lng> drops a pin at the stored coordinates.
 *  - "search" mode: q=<name>, Nepal so staff can see where Google itself finds
 *    the place and compare against the stored pin.
 * t=k satellite, t=m map, t=h hybrid; output=embed makes it iframe-safe.
 */
function embedUrl(place: Place, mode: "coords" | "search", type: MapType): string {
  const q =
    mode === "search"
      ? encodeURIComponent(`${place.name}, Nepal`)
      : `${place.latitude},${place.longitude}`;
  return `https://maps.google.com/maps?q=${q}&z=17&t=${type}&output=embed`;
}

/** External (full-site) Google Maps link — the stored pin, or a name search. */
function externalUrl(place: Place, mode: "coords" | "search"): string {
  return mode === "search"
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name}, Nepal`)}`
    : `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
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

/**
 * Pull a lat,lng out of a Google Maps link or a pasted coordinate string. The
 * keyless embed can't be read directly (cross-origin iframe), so staff copy the
 * coordinate from Google Maps — right-click → "What's here?" gives a bare
 * `lat, lng`, or the page URL carries it. Tries the exact place marker
 * (`!3d..!4d..`) first, then the viewport center (`@lat,lng`), then a `q=`/`ll=`
 * query param, then a bare "lat, lng". Short links (maps.app.goo.gl) carry no
 * coordinate and can't be resolved client-side, so they return null.
 */
function parseLatLng(raw: string): { lat: number; lng: number } | null {
  let s = raw.trim();
  if (!s) return null;
  try {
    s = decodeURIComponent(s);
  } catch {
    /* leave as-is if not valid percent-encoding */
  }
  const N = "(-?\\d{1,3}(?:\\.\\d+)?)";
  const patterns = [
    new RegExp(`!3d${N}!4d${N}`),
    new RegExp(`@${N},\\s*${N}`),
    new RegExp(`[?&](?:q|query|ll|sll)=${N},\\s*${N}`),
    new RegExp(`^\\s*${N}\\s*,\\s*${N}\\s*$`),
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) {
      const lat = parseFloat(m[1]);
      const lng = parseFloat(m[2]);
      if (Math.abs(lat) <= 90 && Math.abs(lng) <= 180) return { lat, lng };
    }
  }
  return null;
}

/** Rough Nepal bounding box — for a "double-check, this looks off" warning only. */
function inNepal(lat: number, lng: number): boolean {
  return lat >= 26 && lat <= 31 && lng >= 79.5 && lng <= 88.5;
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
  const [mapMode, setMapMode] = useState<MapMode>("compare");
  const [editing, setEditing] = useState(false);
  const [verifying, setVerifying] = useState(false);
  // "Set coordinates from Google Maps": pasted link/coords → prefill the edit form.
  const [pasteInput, setPasteInput] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [coordOverride, setCoordOverride] = useState<{ lat: number; lng: number } | null>(null);

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

  // Needs-review first; verified rows sink to the bottom (stable within each
  // group, so a place drops down the moment it's verified). Array.sort is stable.
  const orderedPlaces = places
    ? [...places].sort(
        (a, b) =>
          Number(a.coordinates_verified === true) - Number(b.coordinates_verified === true)
      )
    : [];

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
    setCoordOverride(null);
    setPasteInput("");
    setPasteError("");
  }

  /** Parse the pasted Google Maps link/coords and open the edit form prefilled. */
  function applyPastedCoords() {
    const parsed = parseLatLng(pasteInput);
    if (!parsed) {
      setPasteError(
        "Couldn't find coordinates. Paste a Google Maps URL, or a plain \"lat, lng\" (right-click the map → What's here?)."
      );
      return;
    }
    setPasteError("");
    setCoordOverride(parsed);
    setEditing(true);
  }

  function closeEditor() {
    setEditing(false);
    setCoordOverride(null);
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
                    {orderedPlaces.map((p) => {
                      const verified = p.coordinates_verified === true;
                      const vDate = formatVerified(p.coordinates_verified_at);
                      const active = p.id === selectedId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSelectedId(p.id)}
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
                          {MAP_MODES.map((m) => (
                            <button
                              key={m.key}
                              onClick={() => setMapMode(m.key)}
                              className={
                                "px-3 py-1.5 text-xs transition-colors " +
                                (mapMode === m.key ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white")
                              }
                            >
                              {m.label}
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

                      {/* Keyless Google Maps embed(s) */}
                      {mapMode === "compare" ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">Stored coordinates</div>
                            {hasCoords ? (
                              <iframe
                                key={`${selected.id}-cmp-coords-${mapType}`}
                                title={`Stored pin for ${selected.name}`}
                                src={embedUrl(selected, "coords", mapType)}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-[420px] rounded-lg border border-gray-800"
                              />
                            ) : (
                              <div className="w-full h-[420px] rounded-lg border border-gray-800 flex items-center justify-center text-gray-500 text-sm text-center px-3">
                                No stored coordinates yet
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1 truncate">
                              Google search · “{selected.name}”
                            </div>
                            <iframe
                              key={`${selected.id}-cmp-search-${mapType}`}
                              title={`Google search for ${selected.name}`}
                              src={embedUrl(selected, "search", mapType)}
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                              className="w-full h-[420px] rounded-lg border border-gray-800"
                            />
                          </div>
                        </div>
                      ) : mapMode === "coords" && !hasCoords ? (
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
                        {(mapMode === "compare" || mapMode === "coords") && hasCoords && (
                          <a
                            href={externalUrl(selected, "coords")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {mapMode === "compare" ? "Open stored ↗" : "Open in Google Maps ↗"}
                          </a>
                        )}
                        {(mapMode === "compare" || mapMode === "search") && (
                          <a
                            href={externalUrl(selected, "search")}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            {mapMode === "compare" ? "Open by name ↗" : "Open in Google Maps ↗"}
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

                      {/* Set coordinates from Google Maps (the keyless embed can't
                          be read directly, so staff copy Google's coordinate). */}
                      <div className="mt-4 rounded-lg border border-gray-800 bg-gray-900/40 p-3">
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Set coordinates from Google Maps
                        </label>
                        <p className="text-[11px] text-gray-500 mb-2">
                          On Google Maps, right-click the correct spot → “What’s here?” and copy the{" "}
                          <span className="font-mono">lat, lng</span>, or paste the map URL. Apply → review → Save.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            value={pasteInput}
                            onChange={(e) => {
                              setPasteInput(e.target.value);
                              setPasteError("");
                            }}
                            placeholder="27.7172, 85.3240   or   https://www.google.com/maps/@27.71,85.32,17z"
                            className="flex-1 min-w-[240px] bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600"
                          />
                          <button
                            onClick={applyPastedCoords}
                            className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                          >
                            Apply
                          </button>
                        </div>
                        {pasteError && <p className="text-red-400 text-xs mt-2">{pasteError}</p>}
                        {(() => {
                          const parsed = parseLatLng(pasteInput);
                          if (!parsed) return null;
                          const warn = !inNepal(parsed.lat, parsed.lng);
                          return (
                            <p className={"text-xs mt-2 " + (warn ? "text-amber-400" : "text-gray-400")}>
                              Parsed:{" "}
                              <span className="font-mono">
                                {parsed.lat.toFixed(6)}, {parsed.lng.toFixed(6)}
                              </span>
                              {warn && " · outside Nepal — double-check"}
                            </p>
                          );
                        })()}
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
        <PlaceModal
          mode="edit"
          place={
            coordOverride
              ? { ...selected, latitude: coordOverride.lat, longitude: coordOverride.lng }
              : selected
          }
          onSaved={handleSaved}
          onClose={closeEditor}
        />
      )}
    </div>
  );
}
