"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import PlacesTable from "@/components/PlacesTable";
import AdminHeader from "@/components/AdminHeader";
import type { Place } from "@/components/PlacesTable";

interface Filters {
  name: string;
  category: string;
  country: string;
  state: string;
  district: string;
  municipality: string;
  is_hidden_gem: string; // "all" | "true" | "false"
  active: string; // "all" | "true" | "false"
}

interface FilterOptions {
  countries: string[];
  states: string[];
  districts: string[];
  municipalities: string[];
}

// Fixed enum — matches PlaceIn.category on the backend (admin_places.py).
const CATEGORY_OPTIONS = ["temple", "culture", "nature", "food", "trek", "viewpoint", "unclassified"];

const emptyFilters: Filters = {
  name: "",
  category: "",
  country: "",
  state: "",
  district: "",
  municipality: "",
  is_hidden_gem: "all",
  active: "all",
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [options, setOptions] = useState<FilterOptions>({
    countries: [],
    states: [],
    districts: [],
    municipalities: [],
  });
  const [places, setPlaces] = useState<Place[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the dropdown options once.
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/admin/places/filters");
        if (!res.ok) throw new Error();
        setOptions(await res.json());
      } catch (e) {
        if (e instanceof AuthError) return;
        // Non-fatal — dropdowns just show "— Any —" until options arrive.
      }
    })();
  }, []);

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.name)         params.set("name", filters.name);
    if (filters.category)     params.set("category", filters.category);
    if (filters.country)      params.set("country", filters.country);
    if (filters.state)        params.set("state", filters.state);
    if (filters.district)     params.set("district", filters.district);
    if (filters.municipality) params.set("municipality", filters.municipality);
    if (filters.is_hidden_gem !== "all") params.set("is_hidden_gem", filters.is_hidden_gem);
    if (filters.active !== "all") params.set("active", filters.active);

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
            <FilterSelect
              label="Category"
              value={filters.category}
              onChange={(v) => update("category", v)}
              options={CATEGORY_OPTIONS}
            />
            <FilterSelect
              label="Country"
              value={filters.country}
              onChange={(v) => update("country", v)}
              options={options.countries}
            />
            <FilterSelect
              label="State / Province"
              value={filters.state}
              onChange={(v) => update("state", v)}
              options={options.states}
            />
            <FilterSelect
              label="District"
              value={filters.district}
              onChange={(v) => update("district", v)}
              options={options.districts}
            />
            <FilterSelect
              label="Municipality"
              value={filters.municipality}
              onChange={(v) => update("municipality", v)}
              options={options.municipalities}
            />
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Hidden gem</label>
              <select
                value={filters.is_hidden_gem}
                onChange={(e) => update("is_hidden_gem", e.target.value)}
                className={selectCls}
              >
                <option value="all">— All —</option>
                <option value="true">Hidden gems only</option>
                <option value="false">Regular only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Active</label>
              <select
                value={filters.active}
                onChange={(e) => update("active", e.target.value)}
                className={selectCls}
              >
                <option value="all">— All —</option>
                <option value="true">Active only</option>
                <option value="false">Hidden only</option>
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

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={selectCls}>
        <option value="">— Any —</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
