"use client";

import { useState } from "react";
import type { Place } from "./PlacesTable";
import { BACKEND_URL } from "@/lib/config";
import { getToken } from "@/lib/auth";

interface Props {
  mode: "add" | "edit";
  place?: Place;
  onSaved: (place: Place) => void;
  onClose: () => void;
}

export default function PlaceModal({ mode, place, onSaved, onClose }: Props) {
  const [form, setForm] = useState({
    name: place?.name ?? "",
    description: place?.description ?? "",
    latitude: place?.latitude?.toString() ?? "",
    longitude: place?.longitude?.toString() ?? "",
    geohash: place?.geohash ?? "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const body = {
      name: form.name,
      description: form.description,
      latitude: parseFloat(form.latitude) || 0,
      longitude: parseFloat(form.longitude) || 0,
      geohash: form.geohash,
    };

    const url = mode === "edit"
      ? `${BACKEND_URL}/admin/places/${place!.id}`
      : `${BACKEND_URL}/admin/places`;
    const method = mode === "edit" ? "PUT" : "POST";
    const token = getToken();

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token ?? ""}`,
      },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      const saved = await res.json();
      onSaved(saved);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? data.error ?? "Failed to save place");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {mode === "add" ? "Add place" : "Edit place"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Name" required>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              className={inputCls}
              placeholder="Swayambhunath"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Short description of the place…"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => update("latitude", e.target.value)}
                className={inputCls}
                placeholder="27.7149"
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => update("longitude", e.target.value)}
                className={inputCls}
                placeholder="85.3480"
              />
            </Field>
          </div>

          <Field label="Geohash">
            <input
              type="text"
              value={form.geohash}
              onChange={(e) => update("geohash", e.target.value)}
              className={inputCls}
              placeholder="tuvz1"
            />
          </Field>

          {error && (
            <p className="text-red-400 text-sm bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? "Saving…" : mode === "add" ? "Add place" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors text-sm";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
