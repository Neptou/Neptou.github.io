"use client";

import { useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import FoodsTable from "@/components/FoodsTable";
import type { Food } from "@/components/FoodsTable";

const CATEGORY_OPTIONS = [
  "Staples",
  "Street Food",
  "Newari Specials",
  "Dessert",
  "Drink",
  "Snack",
  "Tharu Specials",
];

interface Filters {
  name: string;
  category: string;
  region: string;
  is_vegetarian: string; // "all" | "true" | "false"
}

const emptyFilters: Filters = {
  name: "",
  category: "",
  region: "",
  is_vegetarian: "all",
};

export default function FoodsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.name)     params.set("name", filters.name);
    if (filters.category) params.set("category", filters.category);
    if (filters.region)   params.set("region", filters.region);
    if (filters.is_vegetarian !== "all") params.set("is_vegetarian", filters.is_vegetarian);

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/admin/foods?${params}`);
      if (!res.ok) throw new Error();
      setFoods(await res.json());
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load foods.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(emptyFilters);
    setFoods(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Foods</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage Nepali cuisine entries shown in the app
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <FilterInput
              label="Name"
              value={filters.name}
              onChange={(v) => update("name", v)}
              placeholder="Dal Bhat…"
            />

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => update("category", e.target.value)}
                className={selectCls}
              >
                <option value="">— All —</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <FilterInput
              label="Region"
              value={filters.region}
              onChange={(v) => update("region", v)}
              placeholder="Kathmandu Valley…"
            />

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Vegetarian
              </label>
              <select
                value={filters.is_vegetarian}
                onChange={(e) => update("is_vegetarian", e.target.value)}
                className={selectCls}
              >
                <option value="all">— All —</option>
                <option value="true">Vegetarian only</option>
                <option value="false">Non-vegetarian only</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? "Searching…" : "Search"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {foods === null && !loading && (
          <p className="text-gray-500 text-center py-16">
            Use the filters above and click Search to load foods.
          </p>
        )}

        {foods !== null && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {foods.length} result{foods.length !== 1 ? "s" : ""}
              {foods.length === 200 && " — showing first 200, narrow your filters for more"}
            </p>
            <FoodsTable
              foods={foods}
              onFoodsChange={(updater) => setFoods((prev) => updater(prev ?? []))}
            />
          </>
        )}
      </main>
    </div>
  );
}

const selectCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-500 transition-colors text-sm";

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
      />
    </div>
  );
}
