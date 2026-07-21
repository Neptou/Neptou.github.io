"use client";

import { useState } from "react";
import FoodModal from "./FoodModal";
import { authFetch, AuthError } from "@/lib/auth";
import { formatVerified, verifyRecord } from "@/lib/verify";

export interface Food {
  id: string;
  name: string;
  name_nepali: string | null;
  description: string | null;
  category: string | null;
  image_url: string | null;
  image_name: string | null;
  image_author: string | null;
  image_license: string | null;
  image_source_url: string | null;
  is_vegetarian: boolean;
  region: string | null;
  verified?: boolean;
  verified_at?: string | null;
  verified_by?: string | null;
}

interface Props {
  foods: Food[];
  onFoodsChange: (updater: (prev: Food[]) => Food[]) => void;
}

export default function FoodsTable({ foods, onFoodsChange }: Props) {
  const [modalState, setModalState] = useState<
    { mode: "add" } | { mode: "edit"; food: Food } | null
  >(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  async function handleVerify(food: Food, verified: boolean) {
    setVerifying(food.id);
    setActionError("");
    try {
      const v = await verifyRecord("/admin/foods", food.id, verified);
      onFoodsChange((prev) => prev.map((f) => (f.id === food.id ? { ...f, ...v } : f)));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to update "${food.name}".`);
    } finally {
      setVerifying(null);
    }
  }

  async function handleDelete(food: Food) {
    if (!confirm(`Delete "${food.name}"? This cannot be undone.`)) return;
    setDeleting(food.id);
    setActionError("");
    try {
      const res = await authFetch(`/admin/foods/${food.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onFoodsChange((prev) => prev.filter((f) => f.id !== food.id));
    } catch (e) {
      if (!(e instanceof AuthError)) setActionError(`Failed to delete "${food.name}".`);
    } finally {
      setDeleting(null);
    }
  }

  function handleSaved(saved: Food) {
    onFoodsChange((prev) => {
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
          + Add food
        </button>
      </div>

      {actionError && <p className="text-red-400 text-sm mb-3">{actionError}</p>}

      <div className="rounded-xl border border-gray-800 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400 uppercase text-xs tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Category</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Region</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Veg</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Image</th>
              <th className="px-4 py-3 text-left whitespace-nowrap">Verified</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {foods.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  No foods found.
                </td>
              </tr>
            )}
            {foods.map((food) => (
              <tr key={food.id} className="hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {food.name}
                  {food.name_nepali && (
                    <span className="block text-xs text-gray-500 font-normal">
                      {food.name_nepali}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {food.category ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-300">
                      {food.category}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-md truncate">
                  {food.description ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {food.region ?? <span className="text-gray-600">—</span>}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  {food.is_vegetarian ? (
                    <span className="text-emerald-400">✓ Veg</span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 max-w-[180px]">
                  {food.image_url ? (
                    <a
                      href={food.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      View ↗
                    </a>
                  ) : food.image_name ? (
                    <span className="text-gray-400 text-xs font-mono">
                      {food.image_name}
                    </span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {food.verified ? (
                    <span className="text-xs text-emerald-400">
                      ✓ Verified
                      {formatVerified(food.verified_at) && (
                        <span className="block text-gray-500">
                          {formatVerified(food.verified_at)}
                          {food.verified_by ? ` · ${food.verified_by}` : ""}
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
                      onClick={() => handleVerify(food, !food.verified)}
                      disabled={verifying === food.id}
                      className="text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {verifying === food.id ? "…" : food.verified ? "Un-verify" : "Mark verified"}
                    </button>
                    <button
                      onClick={() => setModalState({ mode: "edit", food })}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(food)}
                      disabled={deleting === food.id}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40 transition-colors px-2 py-1"
                    >
                      {deleting === food.id ? "…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState && (
        <FoodModal
          mode={modalState.mode}
          food={modalState.mode === "edit" ? modalState.food : undefined}
          onSaved={handleSaved}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
