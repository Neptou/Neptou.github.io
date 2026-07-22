"use client";

import { useState } from "react";
import GuideModal from "./GuideModal";
import { authFetch, AuthError } from "@/lib/auth";
import { formatVerified, verifyRecord } from "@/lib/verify";
import type { PlaceRef } from "./PlaceMultiSelect";

export interface Guide {
  id: string;
  name: string;
  name_nepali: string | null;
  phone: string | null;
  email: string | null;
  specialties: string[] | null;
  languages: string[] | null;
  rating: number | null;
  review_count: number | null;
  price_per_day: number | null;
  bio: string | null;
  location: string | null;
  place_ids: string[] | null;
  places: PlaceRef[] | null; // resolved POIs the guide covers (read-only display)
  license_number: string | null;
  image_url: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source_url: string | null;
  active: boolean;
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

interface Props {
  guides: Guide[];
  onGuidesChange: (updater: (prev: Guide[]) => Guide[]) => void;
}

export default function GuidesTable({ guides, onGuidesChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; guide: Guide } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleVerify(guide: Guide, verified: boolean) {
    setVerifying(guide.id);
    setActionError("");
    try {
      const v = await verifyRecord("/admin/guides", guide.id, verified);
      onGuidesChange((prev) => prev.map((g) => (g.id === guide.id ? { ...g, ...v } : g)));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to update "${guide.name}".`);
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(guide: Guide) {
    if (!confirm(`Delete "${guide.name}"? This cannot be undone.`)) return;
    setDeleting(guide.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/guides/${guide.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onGuidesChange((prev) => prev.filter((g) => g.id !== guide.id));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to delete "${guide.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Guide) {
    onGuidesChange((prev) => {
      const exists = prev.find((g) => g.id === saved.id);
      if (exists) return prev.map((g) => (g.id === saved.id ? saved : g));
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
          + Add guide
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Specialties</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Languages</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Location</th>
              <th className="px-4 py-3 text-left">Places</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Rate/day</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Active</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {guides.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                  No guides found.
                </td>
              </tr>
            )}
            {guides.map((guide) => (
              <tr key={guide.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {guide.name}
                  {guide.name_nepali && (
                    <span className="block text-xs text-gray-500 font-normal">
                      {guide.name_nepali}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {guide.specialties && guide.specialties.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {guide.specialties.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs max-w-[160px]">
                  {guide.languages && guide.languages.length > 0
                    ? guide.languages.join(", ")
                    : <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {guide.location ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3">
                  {guide.places && guide.places.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {guide.places.map((p) => (
                        <span
                          key={p.id}
                          className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300"
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {guide.price_per_day != null ? (
                    `Rs ${guide.price_per_day}`
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {guide.active ? (
                    <span className="text-emerald-400">✓ Active</span>
                  ) : (
                    <span className="text-gray-600">Inactive</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {guide.verified ? (
                    <span className="text-xs text-emerald-400">
                      ✓ Verified
                      {formatVerified(guide.verified_at) && (
                        <span className="block text-gray-500">
                          {formatVerified(guide.verified_at)}
                          {guide.verified_by ? ` · ${guide.verified_by}` : ""}
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
                      onClick={() => handleVerify(guide, !guide.verified)}
                      disabled={verifying === guide.id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {verifying === guide.id ? "…" : guide.verified ? "Un-verify" : "Mark verified"}
                    </button>
                    <button
                      onClick={() => setModalState({ mode: "edit", guide })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(guide)}
                      disabled={deleting === guide.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === guide.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <GuideModal
          mode={modalState.mode}
          guide={modalState.mode === "edit" ? modalState.guide : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
