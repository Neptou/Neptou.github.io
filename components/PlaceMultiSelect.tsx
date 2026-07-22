"use client";

import { useEffect, useRef, useState } from "react";
import { authFetch, AuthError } from "@/lib/auth";

export interface PlaceRef {
  id: string;
  name: string;
}

interface PlaceResult {
  id: string;
  name: string;
  district?: string | null;
}

interface Props {
  value: PlaceRef[];
  onChange: (places: PlaceRef[]) => void;
  placeholder?: string;
}

/**
 * Searchable, multi-value place picker. Type to debounced-search
 * `/admin/places?name=<q>&limit=20`; click a match to add it. Selected places
 * render as removable chips. The parent owns the value (the resolved
 * {id,name}[]); derive place_ids via value.map(p => p.id) on save.
 */
export default function PlaceMultiSelect({
  value,
  onChange,
  placeholder = "Search places to add…",
}: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Debounced search on the query.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const handle = setTimeout(async () => {
      try {
        const params = new URLSearchParams({ name: q, limit: "20" });
        const res = await authFetch(`/admin/places?${params}`);
        if (!res.ok) throw new Error();
        const data: PlaceResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch (e) {
        if (!(e instanceof AuthError)) setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  function add(p: PlaceResult) {
    if (!value.some((v) => v.id === p.id)) {
      onChange([...value, { id: p.id, name: p.name }]);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  function remove(id: string) {
    onChange(value.filter((v) => v.id !== id));
  }

  return (
    <div ref={containerRef} className="relative">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 text-xs bg-gray-800 border border-gray-700 text-gray-200 rounded-full pl-3 pr-1.5 py-1"
            >
              {p.name}
              <button
                type="button"
                onClick={() => remove(p.id)}
                className="text-gray-400 hover:text-white leading-none text-sm"
                aria-label={`Remove ${p.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setOpen(true)}
        className={inputCls}
      />

      {open && query.trim() && (
        <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-2xl text-sm">
          {loading && (
            <li className="px-3 py-2 text-gray-500">Searching…</li>
          )}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-gray-500">No places found.</li>
          )}
          {!loading &&
            results.map((p) => {
              const already = value.some((v) => v.id === p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={already}
                    onClick={() => add(p)}
                    className={
                      "w-full text-left px-3 py-2 transition-colors flex items-center justify-between gap-2 " +
                      (already
                        ? "text-gray-600 cursor-default"
                        : "text-gray-300 hover:bg-gray-700")
                    }
                  >
                    <span>
                      {p.name}
                      {p.district && (
                        <span className="text-gray-500"> · {p.district}</span>
                      )}
                    </span>
                    {already && <span className="text-xs text-gray-600">added</span>}
                  </button>
                </li>
              );
            })}
        </ul>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm";
