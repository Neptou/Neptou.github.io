"use client";

// Shared place-filter form used by both the Places dashboard and the Maps
// coordinate-verification tab, so the two stay in lockstep. It is presentational:
// callers own the filter state and the fetch; this renders the controls plus a
// Search / Reset pair and calls back on change/submit/reset.

export interface Filters {
  name: string;
  category: string;
  country: string;
  state: string;
  district: string;
  municipality: string;
  is_hidden_gem: string; // "all" | "true" | "false"
  active: string; // "all" | "true" | "false"
}

export interface FilterOptions {
  countries: string[];
  states: string[];
  districts: string[];
  municipalities: string[];
}

// Fixed enum — matches PlaceIn.category on the backend (admin_places.py).
export const CATEGORY_OPTIONS = ["temple", "culture", "nature", "food", "trek", "viewpoint", "unclassified"];

export const emptyFilters: Filters = {
  name: "",
  category: "",
  country: "",
  state: "",
  district: "",
  municipality: "",
  is_hidden_gem: "all",
  active: "all",
};

/** Build the GET /admin/places query string from the filter state (no limit). */
export function buildPlaceQuery(filters: Filters): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.name)         params.set("name", filters.name);
  if (filters.category)     params.set("category", filters.category);
  if (filters.country)      params.set("country", filters.country);
  if (filters.state)        params.set("state", filters.state);
  if (filters.district)     params.set("district", filters.district);
  if (filters.municipality) params.set("municipality", filters.municipality);
  if (filters.is_hidden_gem !== "all") params.set("is_hidden_gem", filters.is_hidden_gem);
  if (filters.active !== "all") params.set("active", filters.active);
  return params;
}

interface Props {
  filters: Filters;
  options: FilterOptions;
  onChange: (field: keyof Filters, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onReset: () => void;
  loading: boolean;
}

export default function PlaceFilters({ filters, options, onChange, onSubmit, onReset, loading }: Props) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <FilterInput
          label="Name"
          value={filters.name}
          onChange={(v) => onChange("name", v)}
          placeholder="Swayambhunath…"
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          onChange={(v) => onChange("category", v)}
          options={CATEGORY_OPTIONS}
        />
        <FilterSelect
          label="Country"
          value={filters.country}
          onChange={(v) => onChange("country", v)}
          options={options.countries}
        />
        <FilterSelect
          label="State / Province"
          value={filters.state}
          onChange={(v) => onChange("state", v)}
          options={options.states}
        />
        <FilterSelect
          label="District"
          value={filters.district}
          onChange={(v) => onChange("district", v)}
          options={options.districts}
        />
        <FilterSelect
          label="Municipality"
          value={filters.municipality}
          onChange={(v) => onChange("municipality", v)}
          options={options.municipalities}
        />
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Hidden gem</label>
          <select
            value={filters.is_hidden_gem}
            onChange={(e) => onChange("is_hidden_gem", e.target.value)}
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
            onChange={(e) => onChange("active", e.target.value)}
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
          onClick={onReset}
          className="text-gray-400 hover:text-white text-sm transition-colors"
        >
          Reset
        </button>
      </div>
    </form>
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
