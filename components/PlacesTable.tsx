"use client";

import { useState } from "react";
import PlaceModal from "./PlaceModal";

export interface Place {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  geohash: string;
}

export default function PlacesTable({ initialPlaces }: { initialPlaces: Place[] }) {
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  const [search, setSearch] = useState("");
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; place: Place } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = places.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(place: Place) {
    if (!confirm(`Delete "${place.name}"? This cannot be undone.`)) return;
    setDeleting(place.id);
    const res = await fetch(`/api/admin/places/${place.id}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
    } else {
      alert("Failed to delete place.");
    }
  }

  function handleSaved(saved: Place) {
    setPlaces((prev) => {
      const exists = prev.find((p) => p.id === saved.id);
      if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [saved, ...prev];
    });
    setModalState(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search places…"
          className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors w-72"
        />
        <button
          onClick={() => setModalState({ mode: "add" })}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add place
        </button>
      </div>

      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Coordinates</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Geohash</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No places found.
                </td>
              </tr>
            )}
            {filtered.map((place) => (
              <tr key={place.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{place.name}</td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell max-w-xs truncate">
                  {place.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs font-mono">
                  {place.latitude?.toFixed(4)}, {place.longitude?.toFixed(4)}
                </td>
                <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs font-mono">
                  {place.geohash ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
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
