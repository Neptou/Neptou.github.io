"use client";

import { useState } from "react";
import HotelModal from "./HotelModal";
import { authFetch, AuthError } from "@/lib/auth";
import { formatVerified, verifyRecord } from "@/lib/verify";

export interface Hotel {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  category: string | null;
  star_rating: number | null;
  latitude: number | null;
  longitude: number | null;
  geohash: string | null;
  division_id: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  price_per_night: number | null;
  amenities: string[] | null;
  rating: number | null;
  review_count: number | null;
  image_url: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source_url: string | null;
  images?: {
    id: string;
    image_url: string;
    image_author: string | null;
    image_license: string | null;
    image_source_url: string | null;
    sort_order: number;
  }[];
  active: boolean;
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
  // joined location fields (read-only, like places)
  country?: string | null;
  state?: string | null;
  district?: string | null;
  municipality?: string | null;
}

interface Props {
  hotels: Hotel[];
  onHotelsChange: (updater: (prev: Hotel[]) => Hotel[]) => void;
}

export default function HotelsTable({ hotels, onHotelsChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; hotel: Hotel } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleVerify(hotel: Hotel, verified: boolean) {
    setVerifying(hotel.id);
    setActionError("");
    try {
      const v = await verifyRecord("/admin/hotels", hotel.id, verified);
      onHotelsChange((prev) => prev.map((h) => (h.id === hotel.id ? { ...h, ...v } : h)));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to update "${hotel.name}".`);
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(hotel: Hotel) {
    if (!confirm(`Delete "${hotel.name}"? This cannot be undone.`)) return;
    setDeleting(hotel.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/hotels/${hotel.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onHotelsChange((prev) => prev.filter((h) => h.id !== hotel.id));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to delete "${hotel.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Hotel) {
    onHotelsChange((prev) => {
      const exists = prev.find((h) => h.id === saved.id);
      if (exists) return prev.map((h) => (h.id === saved.id ? saved : h));
      return [saved, ...prev];
    });
    setModalState(null);
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-3 mb-4">
        <button
          onClick={() => setModalState({ mode: "add" })}
          className="bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          + Add hotel
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Stars</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Price/night</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Active</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Image</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {hotels.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No hotels found.
                </td>
              </tr>
            )}
            {hotels.map((hotel) => (
              <tr key={hotel.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {hotel.name}
                  {hotel.name_nepali && (
                    <span className="block text-xs text-gray-500 font-normal">
                      {hotel.name_nepali}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {hotel.category ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {hotel.category}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {hotel.star_rating ? (
                    <span className="text-amber-400">
                      {"★".repeat(hotel.star_rating)}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {hotel.district ?? hotel.address ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {hotel.price_per_night != null ? (
                    `Rs ${hotel.price_per_night}`
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {hotel.active ? (
                    <span className="text-emerald-400">✓ Active</span>
                  ) : (
                    <span className="text-gray-600">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  <div className="flex items-center gap-2">
                    {hotel.image_url ? (
                      <a
                        href={hotel.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        View ↗
                      </a>
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                    {(hotel.images ?? []).length > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-800 text-gray-400 whitespace-nowrap">
                        +{(hotel.images ?? []).length} photo
                        {(hotel.images ?? []).length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {hotel.verified ? (
                    <span className="text-xs text-emerald-400">
                      ✓ Verified
                      {formatVerified(hotel.verified_at) && (
                        <span className="block text-gray-500">
                          {formatVerified(hotel.verified_at)}
                          {hotel.verified_by ? ` · ${hotel.verified_by}` : ""}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">○ Needs review</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleVerify(hotel, !hotel.verified)}
                      disabled={verifying === hotel.id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {verifying === hotel.id ? "…" : hotel.verified ? "Un-verify" : "Mark verified"}
                    </button>
                    <button
                      onClick={() => setModalState({ mode: "edit", hotel })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(hotel)}
                      disabled={deleting === hotel.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === hotel.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <HotelModal
          mode={modalState.mode}
          hotel={modalState.mode === "edit" ? modalState.hotel : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
