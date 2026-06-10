"use client";

import { useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import PlacesTable from "@/components/PlacesTable";
import AdminHeader from "@/components/AdminHeader";
import type { Place } from "@/components/PlacesTable";

interface Filters {
  name: string;
  country: string;
  state: string;
  district: string;
  municipality: string;
}

const emptyFilters: Filters = {
  name: "",
  country: "",
  state: "",
  district: "",
  municipality: "",
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.name)         params.set("name", filters.name);
    if (filters.country)      params.set("country", filters.country);
    if (filters.state)        params.set("state", filters.state);
    if (filters.district)     params.set("district", filters.district);
    if (filters.municipality) params.set("municipality", filters.municipality);

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/admin/places?${params}`);
      if (!res.ok) throw new Error();
      setPlaces(await res.json());
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load places.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(emptyFilters);
    setPlaces(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Places</h1>
          <p className="text-gray-400 text-sm mt-1">Filter and search the database</p>
        </div>

        {/* Filter panel */}
        <form
          onSubmit={handleSearch}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            <FilterInput
              label="Name"
              value={filters.name}
              onChange={(v) => update("name", v)}
              placeholder="Swayambhunath…"
            />
            <FilterInput
              label="Country"
              value={filters.country}
              onChange={(v) => update("country", v)}
              placeholder="Nepal…"
            />
            <FilterInput
              label="State / Province"
              value={filters.state}
              onChange={(v) => update("state", v)}
              placeholder="Bagmati…"
            />
            <FilterInput
              label="District"
              value={filters.district}
              onChange={(v) => update("district", v)}
              placeholder="Kathmandu…"
            />
            <FilterInput
              label="Municipality"
              value={filters.municipality}
              onChange={(v) => update("municipality", v)}
              placeholder="Kathmandu Metropolitan…"
            />
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

        {error && (
          <p className="text-red-400 mb-4">{error}</p>
        )}

        {places === null && !loading && (
          <p className="text-gray-500 text-center py-16">
            Use the filters above and click Search to load places.
          </p>
        )}

        {places !== null && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {places.length} result{places.length !== 1 ? "s" : ""}
              {places.length === 100 && " — showing first 100, narrow your filters for more"}
            </p>
            <PlacesTable places={places} onPlacesChange={(updater) => setPlaces((prev) => updater(prev ?? []))} />
          </>
        )}
      </main>
    </div>
  );
}

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
