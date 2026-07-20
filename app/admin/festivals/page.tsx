"use client";

import { useEffect, useMemo, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import { getDivisions, divisionLabel, type Division } from "@/lib/divisions";
import AdminHeader from "@/components/AdminHeader";
import DivisionSelect from "@/components/DivisionSelect";
import FestivalsTable from "@/components/FestivalsTable";
import type { Festival } from "@/components/FestivalsTable";

const CATEGORY_OPTIONS = [
  "Jatra",
  "Religious Festival",
  "National Holiday",
  "Cultural",
  "Harvest",
];

const NEPALI_MONTHS = [
  "Baishakh",
  "Jestha",
  "Ashadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
];

interface Filters {
  name: string;
  category: string;
  division_id: string;
  nepali_month: string;
  is_active: string; // "all" | "true" | "false"
}

const emptyFilters: Filters = {
  name: "",
  category: "",
  division_id: "",
  nepali_month: "",
  is_active: "all",
};

export default function FestivalsPage() {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [festivals, setFestivals] = useState<Festival[] | null>(null);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getDivisions()
      .then(setDivisions)
      .catch(() => {});
  }, []);

  // Resolve a festival's division_id to a readable district label for the table.
  const divisionLabelById = useMemo(() => {
    const byId = new Map(divisions.map((d) => [d.id, divisionLabel(d)]));
    return (id: string) => byId.get(id) ?? null;
  }, [divisions]);

  function update(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (filters.name) params.set("name", filters.name);
    if (filters.category) params.set("category", filters.category);
    if (filters.division_id) params.set("division_id", filters.division_id);
    if (filters.nepali_month) params.set("nepali_month", filters.nepali_month);
    if (filters.is_active !== "all") params.set("is_active", filters.is_active);

    setLoading(true);
    setError("");

    try {
      const res = await authFetch(`/admin/festivals?${params}`);
      if (!res.ok) throw new Error();
      setFestivals(await res.json());
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load festivals.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFilters(emptyFilters);
    setFestivals(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Festivals &amp; Jatras</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage Nepali festivals and jatras shown in the app
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            <FilterInput
              label="Name"
              value={filters.name}
              onChange={(v) => update("name", v)}
              placeholder="Bisket Jatra…"
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
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                District
              </label>
              <DivisionSelect
                value={filters.division_id}
                onChange={(id) => update("division_id", id)}
                allowClear
                placeholder="Search district…"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Nepali month
              </label>
              <select
                value={filters.nepali_month}
                onChange={(e) => update("nepali_month", e.target.value)}
                className={selectCls}
              >
                <option value="">— All —</option>
                {NEPALI_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Status
              </label>
              <select
                value={filters.is_active}
                onChange={(e) => update("is_active", e.target.value)}
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

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {festivals === null && !loading && (
          <p className="text-gray-500 text-center py-16">
            Use the filters above and click Search to load festivals.
          </p>
        )}

        {festivals !== null && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {festivals.length} result{festivals.length !== 1 ? "s" : ""}
              {festivals.length === 200 &&
                " — showing first 200, narrow your filters for more"}
            </p>
            <FestivalsTable
              festivals={festivals}
              divisionLabelById={divisionLabelById}
              onFestivalsChange={(updater) =>
                setFestivals((prev) => updater(prev ?? []))
              }
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
      <label className="block text-xs font-medium text-gray-400 mb-1">
        {label}
      </label>
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
