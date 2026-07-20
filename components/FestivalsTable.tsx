"use client";

import { useState } from "react";
import FestivalModal from "./FestivalModal";
import { authFetch, AuthError } from "@/lib/auth";

export interface Festival {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  significance: string | null;
  category: string | null;
  start_date: string | null; // ISO date (YYYY-MM-DD)
  end_date: string | null;
  nepali_date: string | null;
  nepali_month: string | null;
  duration_days: number | null;
  is_recurring: boolean;
  division_id: string | null;
  place_id: string | null;
  region: string | null;
  image_url: string | null;
  image_name: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source_url: string | null;
  is_active: boolean;
  last_updated?: string | null;
}

interface Props {
  festivals: Festival[];
  onFestivalsChange: (updater: (prev: Festival[]) => Festival[]) => void;
}

function dateRange(f: Festival): string {
  if (f.start_date && f.end_date && f.start_date !== f.end_date)
    return `${f.start_date} → ${f.end_date}`;
  return f.start_date ?? "—";
}

export default function FestivalsTable({ festivals, onFestivalsChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; festival: Festival } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleDelete(festival: Festival) {
    if (!confirm(`Delete "${festival.name}"? This cannot be undone.`)) return;
    setDeleting(festival.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/festivals/${festival.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onFestivalsChange((prev) => prev.filter((f) => f.id !== festival.id));
    } catch (e) {
      if (!(e instanceof AuthError))
        setActionError(`Failed to delete "${festival.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Festival) {
    onFestivalsChange((prev) => {
      const exists = prev.find((f) => f.id === saved.id);
      if (exists) return prev.map((f) => (f.id === saved.id ? saved : f));
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
          + Add festival
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Dates</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Nepali date</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Region</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Active</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Image</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {festivals.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No festivals found.
                </td>
              </tr>
            )}
            {festivals.map((festival) => (
              <tr
                key={festival.id}
                className="hover:bg-gray-900/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {festival.name}
                  {festival.name_nepali && (
                    <span className="block text-xs text-gray-500 font-normal">
                      {festival.name_nepali}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {festival.category ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {festival.category}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {dateRange(festival)}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {festival.nepali_date ?? (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {festival.region ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {festival.is_active ? (
                    <span className="text-emerald-400">✓ Active</span>
                  ) : (
                    <span className="text-gray-600">Hidden</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  {festival.image_url ? (
                    <a
                      href={festival.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View ↗
                    </a>
                  ) : festival.image_name ? (
                    <span className="text-gray-400 text-xs font-mono">
                      {festival.image_name}
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setModalState({ mode: "edit", festival })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(festival)}
                      disabled={deleting === festival.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === festival.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <FestivalModal
          mode={modalState.mode}
          festival={
            modalState.mode === "edit" ? modalState.festival : undefined
          }
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
