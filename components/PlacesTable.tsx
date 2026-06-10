"use client";

import { useState, useRef, useEffect } from "react";
import PlaceModal from "./PlaceModal";
import { authFetch, AuthError } from "@/lib/auth";

export interface Place {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  category: string | null;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  is_hidden_gem: boolean;
  tips: string[] | null;
  rating: number | null;
  review_count: number | null;
  opening_hours: string | null;
  entry_fee: string | null;
  image_url: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source_url: string | null;
  division_id: string | null;
  country: string | null;
  state: string | null;
  district: string | null;
  municipality: string | null;
}

const ALL_COLUMNS = [
  { key: "category",      label: "Category" },
  { key: "description",   label: "Description" },
  { key: "location",      label: "Location" },
  { key: "coordinates",   label: "Coordinates" },
  { key: "rating",        label: "Rating" },
  { key: "review_count",  label: "Review Count" },
  { key: "hidden_gem",    label: "Hidden Gem" },
  { key: "image",         label: "Image" },
  { key: "opening_hours", label: "Opening Hours" },
  { key: "entry_fee",     label: "Entry Fee" },
  { key: "photo_author",  label: "Photo / License" },
] as const;

type ColKey = typeof ALL_COLUMNS[number]["key"];

const DEFAULT_VISIBLE = new Set<ColKey>(["category", "description", "location", "coordinates"]);

interface Props {
  places: Place[];
  onPlacesChange: (updater: (prev: Place[]) => Place[]) => void;
}

export default function PlacesTable({ places, onPlacesChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; place: Place } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [visibleCols, setVisibleCols] = useState<Set<ColKey>>(DEFAULT_VISIBLE);
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const colMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (colMenuRef.current && !colMenuRef.current.contains(e.target as Node)) {
        setColMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleCol(key: ColKey) {
    setVisibleCols((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function show(key: ColKey) {
    return visibleCols.has(key);
  }

  async function handleDelete(place: Place) {
    if (!confirm(`Delete "${place.name}"? This cannot be undone.`)) return;
    setDeleting(place.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/places/${place.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onPlacesChange((prev) => prev.filter((p) => p.id !== place.id));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to delete "${place.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Place) {
    onPlacesChange((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    setModalState(null);
  }

  function divisionLabel(place: Place) {
    return [place.district, place.state, place.country].filter(Boolean).join(", ") || "—";
  }

  const colSpan = 2 + visibleCols.size;

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-4">
        {/* Column toggle */}
        <div className="relative" ref={colMenuRef}>
          <button
            onClick={() => setColMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 bg-gray-900 px-3 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M3 9h18M3 15h18" />
            </svg>
            Columns
            <span className="ml-0.5 text-xs text-gray-500">({visibleCols.size}/{ALL_COLUMNS.length})</span>
          </button>

          {colMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl z-20 p-2">
              <p className="text-xs text-gray-500 px-2 py-1 mb-1">Toggle columns</p>
              {ALL_COLUMNS.map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={visibleCols.has(key)}
                    onChange={() => toggleCol(key)}
                    className="w-3.5 h-3.5 accent-red-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">{label}</span>
                  {visibleCols.has(key) && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
                  )}
                </label>
              ))}
              <div className="border-t border-gray-800 mt-2 pt-2 flex gap-2 px-2">
                <button
                  onClick={() => setVisibleCols(new Set(ALL_COLUMNS.map((c) => c.key)))}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  All
                </button>
                <button
                  onClick={() => setVisibleCols(DEFAULT_VISIBLE)}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setModalState({ mode: "add" })}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add place
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              {show("category")      && <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>}
              {show("description")   && <th className="px-4 py-3 text-left">Description</th>}
              {show("location")      && <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>}
              {show("coordinates")   && <th className="px-4 py-3 text-left whitespace-nowrap">Coordinates</th>}
              {show("rating")        && <th className="px-4 py-3 text-left whitespace-nowrap">Rating</th>}
              {show("review_count")  && <th className="px-4 py-3 text-left whitespace-nowrap">Reviews</th>}
              {show("hidden_gem")    && <th className="px-4 py-3 text-left whitespace-nowrap">Hidden Gem</th>}
              {show("image")         && <th className="px-4 py-3 text-left whitespace-nowrap">Image</th>}
              {show("opening_hours") && <th className="px-4 py-3 text-left whitespace-nowrap">Hours</th>}
              {show("entry_fee")     && <th className="px-4 py-3 text-left whitespace-nowrap">Entry Fee</th>}
              {show("photo_author")  && <th className="px-4 py-3 text-left whitespace-nowrap">Photo / License</th>}
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {places.length === 0 && (
              <tr>
                <td colSpan={colSpan} className="px-4 py-8 text-center text-gray-500">
                  No places found.
                </td>
              </tr>
            )}
            {places.map((place) => (
              <tr key={place.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {place.name}
                  {place.name_nepali && (
                    <span className="block text-xs text-gray-500 font-normal">{place.name_nepali}</span>
                  )}
                </td>

                {show("category") && (
                  <td className="px-4 py-3">
                    {place.category
                      ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 capitalize">{place.category}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("description") && (
                  <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                    {place.description ?? "—"}
                  </td>
                )}

                {show("location") && (
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {divisionLabel(place)}
                  </td>
                )}

                {show("coordinates") && (
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono whitespace-nowrap">
                    {place.latitude != null && place.longitude != null
                      ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                      : "—"}
                  </td>
                )}

                {show("rating") && (
                  <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                    {place.rating != null
                      ? <span className="flex items-center gap-1">⭐ {place.rating.toFixed(1)}</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("review_count") && (
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {place.review_count ?? <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("hidden_gem") && (
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {place.is_hidden_gem
                      ? <span className="text-emerald-400">✦ Yes</span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("image") && (
                  <td className="px-4 py-3 max-w-[180px]">
                    {place.image_url ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs truncate block" title={place.image_url}>
                          {place.image_url.replace(/^https?:\/\//, "").slice(0, 40)}…
                        </span>
                        <a
                          href={place.image_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit"
                        >
                          View ↗
                        </a>
                      </div>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                )}

                {show("opening_hours") && (
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {place.opening_hours ?? <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("entry_fee") && (
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {place.entry_fee ?? <span className="text-gray-600">—</span>}
                  </td>
                )}

                {show("photo_author") && (
                  <td className="px-4 py-3 text-xs whitespace-nowrap">
                    {place.image_author
                      ? <span className="text-gray-300">{place.image_author}<br /><span className="text-gray-500">{place.image_license ?? ""}</span></span>
                      : <span className="text-gray-600">—</span>}
                  </td>
                )}

                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setModalState({ mode: "edit", place })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(place)}
                      disabled={deleting === place.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === place.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <PlaceModal
          mode={modalState.mode}
          place={modalState.mode === "edit" ? modalState.place : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
