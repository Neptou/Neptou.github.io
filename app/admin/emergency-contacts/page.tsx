"use client";

import { useEffect, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";
import AdminHeader from "@/components/AdminHeader";
import EmergencyContactsTable from "@/components/EmergencyContactsTable";
import type { EmergencyContact } from "@/components/EmergencyContactsTable";

interface FilterOptions {
  categories: string[];
  provinces: string[];
}

export default function EmergencyContactsPage() {
  const [contacts, setContacts] = useState<EmergencyContact[] | null>(null);
  const [options, setOptions] = useState<FilterOptions>({ categories: [], provinces: [] });
  const [category, setCategory] = useState("");
  const [province, setProvince] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // At least one filter must be set — the full list is too large to load at once.
  const hasFilter = Boolean(category || province || name.trim());

  // Load the dropdown options once. Do NOT load contacts until a filter is chosen.
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch("/admin/emergency-contacts/filters");
        if (!res.ok) throw new Error();
        setOptions(await res.json());
      } catch (e) {
        if (e instanceof AuthError) return;
        // Non-fatal — dropdowns just stay empty; the name filter still works.
      }
    })();
  }, []);

  async function load() {
    if (!hasFilter) return;
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (province) params.set("province", province);
    if (name.trim()) params.set("name", name.trim());

    try {
      const res = await authFetch(`/admin/emergency-contacts?${params}`);
      if (!res.ok) throw new Error();
      setContacts(await res.json());
    } catch (e) {
      if (e instanceof AuthError) return;
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    load();
  }

  function handleReset() {
    setCategory("");
    setProvince("");
    setName("");
    setContacts(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <AdminHeader />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Emergency Contacts</h1>
          <p className="text-gray-400 text-sm mt-1">
            Choose at least one filter to load contacts — the full list is too large to show at once.
          </p>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end"
        >
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldCls}
            >
              <option value="">— Any —</option>
              {options.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Province</label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className={fieldCls}
            >
              <option value="">— Any —</option>
              {options.provinces.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Name contains</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tourist Police…"
              className={fieldCls}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !hasFilter}
              title={!hasFilter ? "Select at least one filter first" : undefined}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              {loading ? "Loading…" : "Search"}
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

        {contacts === null ? (
          <p className="text-gray-500 text-sm">
            Pick a category or province (or type a name), then press Search to load contacts.
          </p>
        ) : (
          <>
            <p className="text-gray-400 text-sm mb-4">
              {contacts.length} result{contacts.length !== 1 ? "s" : ""}
            </p>
            <EmergencyContactsTable
              contacts={contacts}
              onContactsChange={(updater) =>
                setContacts((prev) => updater(prev ?? []))
              }
            />
          </>
        )}
      </main>
    </div>
  );
}

const fieldCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors text-sm";
