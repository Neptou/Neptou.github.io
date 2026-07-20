"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  getDivisions,
  divisionLabel,
  type Division,
} from "@/lib/divisions";

interface Props {
  value: string; // division_id, or "" for none
  onChange: (id: string) => void;
  placeholder?: string;
  allowClear?: boolean;
}

/**
 * Searchable district picker backed by place_divisions. Type to filter; click a
 * row to select (stores division_id); "×" clears. Closes on click-outside/Escape.
 */
export default function DivisionSelect({
  value,
  onChange,
  placeholder = "Search district…",
  allowClear = true,
}: Props) {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDivisions()
      .then(setDivisions)
      .catch(() => {});
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selected = useMemo(
    () => divisions.find((d) => d.id === value) ?? null,
    [divisions, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? divisions.filter((d) => divisionLabel(d).toLowerCase().includes(q))
      : divisions;
    return list.slice(0, 50); // cap the rendered list for performance
  }, [divisions, query]);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setQuery("");
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && open && filtered[highlight]) {
      e.preventDefault();
      select(filtered[highlight].id);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={open ? query : selected ? divisionLabel(selected) : ""}
          placeholder={placeholder}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={inputCls}
        />
        {allowClear && value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setQuery("");
            }}
            className="text-gray-400 hover:text-white text-lg leading-none px-1"
            aria-label="Clear district"
          >
            ×
          </button>
        )}
      </div>

      {open && (
        <ul className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 shadow-2xl text-sm">
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-gray-500">No districts found.</li>
          )}
          {filtered.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                onMouseEnter={() => setHighlight(i)}
                onClick={() => select(d.id)}
                className={
                  "w-full text-left px-3 py-2 transition-colors " +
                  (i === highlight
                    ? "bg-gray-700 text-white"
                    : "text-gray-300 hover:bg-gray-700")
                }
              >
                {divisionLabel(d)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm";
