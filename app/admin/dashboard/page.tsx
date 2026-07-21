"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import PlacesTable from "@/components/PlacesTable";
import AdminHeader from "@/components/AdminHeader";
import type { Place } from "@/components/PlacesTable";
import PlaceFilters, {
  buildPlaceQuery,
  emptyFilters,
  type Filters,
  type FilterOptions,
} from "@/components/PlaceFilters";

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

    const params = buildPlaceQuery(filters);

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

        <PlaceFilters
          filters={filters}
          options={options}
          onChange={update}
          onSubmit={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

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
