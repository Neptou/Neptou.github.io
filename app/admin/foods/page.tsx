"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import FoodsTable from "@/components/FoodsTable";
import type { Food } from "@/components/FoodsTable";

export default function FoodsPage() {
  const [foods, setFoods] = useState<Food[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  async function load(query: string) {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (query) params.set("name", query);

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

  useEffect(() => {
    load("");
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load(search);
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
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
        >
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-400 mb-1">
              Search by name
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Dal Bhat…"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? "Loading…" : "Search"}
            </button>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                load("");
              }}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Reset
            </button>
          </div>
        </form>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {foods !== null && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {foods.length} result{foods.length !== 1 ? "s" : ""}
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
