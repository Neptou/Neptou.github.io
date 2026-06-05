"use client";

import { useState } from "react";
import PlaceModal from "./PlaceModal";
import { BACKEND_URL } from "@/lib/config";
import { getToken } from "@/lib/auth";

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

interface Props {
  places: Place[];
  onPlacesChange: (updater: (prev: Place[]) => Place[]) => void;
}

export default function PlacesTable({ places, onPlacesChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; place: Place } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(place: Place) {
    if (!confirm(`Delete "${place.name}"? This cannot be undone.`)) return;
    setDeleting(place.id);
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/admin/places/${place.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    });
    setDeleting(null);
    if (res.ok) {
      onPlacesChange((prev) => prev.filter((p) => p.id !== place.id));
    } else {
      alert("Failed to delete place.");
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
    return [place.district, place.state, place.country]
      .filter(Boolean)
      .join(", ") || "—";
  }

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
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
              <th className="px-4 py-3 text-left hidden sm:table-cell">Category</th>
              <th className="px-4 py-3 text-left hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Location</th>
              <th className="px-4 py-3 text-left hidden lg:table-cell">Coordinates</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {places.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No places found.
                </td>
              </tr>
            )}
            {places.map((place) => (
              <tr key={place.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{place.name}</td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  {place.category
                    ? <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300 capitalize">{place.category}</span>
                    : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell max-w-xs truncate">
                  {place.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs">
                  {divisionLabel(place)}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell text-xs font-mono">
                  {place.latitude != null && place.longitude != null
                    ? `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`
                    : "—"}
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
