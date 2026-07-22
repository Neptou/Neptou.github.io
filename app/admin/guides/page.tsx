"use client";

import { useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import GuidesTable from "@/components/GuidesTable";
import type { Guide } from "@/components/GuidesTable";

const SPECIALTY_OPTIONS = [
  "Trekking",
  "Cultural Tours",
  "Photography",
  "Wildlife",
  "Adventure Sports",
  "Meditation",
  "Food Tours",
  "History",
];

interface Filters {
  name: string;
  specialty: string;
  language: string;
  active: string; // "all" | "true" | "false"
}

const emptyFilters: Filters = {
  name: "",
  specialty: "",
  language: "",
  active: "all",
};

export default function GuidesPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.name)      params.set("name", filters.name);
    if (filters.specialty) params.set("specialty", filters.specialty);
    if (filters.language)  params.set("language", filters.language);
    if (filters.active !== "all") params.set("active", filters.active);

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/admin/guides?${params}`);
      if (!res.ok) throw new Error();
      setGuides(await res.json());
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load guides.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(emptyFilters);
    setGuides(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Guides</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage tour guide listings shown in the app
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
              placeholder="Pemba Sherpa…"
            />

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) => update("specialty", e.target.value)}
                className={selectCls}
              >
                <option value="">— All —</option>
                {SPECIALTY_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <FilterInput
              label="Language"
              value={filters.language}
              onChange={(v) => update("language", v)}
              placeholder="English…"
            />

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Active
              </label>
              <select
                value={filters.active}
                onChange={(e) => update("active", e.target.value)}
                className={selectCls}
              >
                <option value="all">— All —</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
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

        {guides === null && !loading && (
          <p className="text-gray-500 text-center py-16">
            Use the filters above and click Search to load guides.
          </p>
        )}

        {guides !== null && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {guides.length} result{guides.length !== 1 ? "s" : ""}
              {guides.length === 200 && " — showing first 200, narrow your filters for more"}
            </p>
            <GuidesTable
              guides={guides}
              onGuidesChange={(updater) => setGuides((prev) => updater(prev ?? []))}
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
